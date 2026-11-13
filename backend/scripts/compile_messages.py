#!/usr/bin/env python3
"""Compile `locale/**/*.po` to `.mo` without GNU gettext (msgfmt).

Supports the subset of PO syntax used in this project: msgctxt, msgid, msgstr and
multi-line strings. Usage: `python scripts/compile_messages.py`.
"""

from __future__ import annotations

import ast
import struct
import sys
from pathlib import Path

LOCALE_DIR = Path(__file__).resolve().parent.parent / "locale"


def parse_po(path: Path) -> dict[str, str]:
    entries: dict[str, str] = {}
    ctx = msgid = msgstr = None
    field = None

    def flush():
        if msgid is not None and msgstr is not None and (msgstr or msgid == ""):
            key = f"{ctx}\x04{msgid}" if ctx is not None else msgid
            entries[key] = msgstr

    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("msgctxt "):
            flush()
            ctx, msgid, msgstr, field = ast.literal_eval(line[8:]), None, None, "ctx"
        elif line.startswith("msgid "):
            if field == "str":
                flush()
                ctx = None
            msgid, msgstr, field = ast.literal_eval(line[6:]), None, "id"
        elif line.startswith("msgstr "):
            msgstr, field = ast.literal_eval(line[7:]), "str"
        elif line.startswith('"'):
            value = ast.literal_eval(line)
            if field == "id":
                msgid += value
            elif field == "str":
                msgstr += value
            elif field == "ctx":
                ctx += value
    flush()
    return entries


def write_mo(entries: dict[str, str], path: Path) -> None:
    keys = sorted(entries)
    ids = b"".join(k.encode() + b"\0" for k in keys)
    strs = b"".join(entries[k].encode() + b"\0" for k in keys)
    n = len(keys)
    header_size = 7 * 4
    ids_table = header_size
    strs_table = ids_table + n * 8
    data_start = strs_table + n * 8

    id_offsets, str_offsets = [], []
    offset = data_start
    for k in keys:
        b = k.encode()
        id_offsets.append((len(b), offset))
        offset += len(b) + 1
    for k in keys:
        b = entries[k].encode()
        str_offsets.append((len(b), offset))
        offset += len(b) + 1

    out = struct.pack("Iiiiiii", 0x950412DE, 0, n, ids_table, strs_table, 0, 0)
    out += b"".join(struct.pack("ii", *o) for o in id_offsets)
    out += b"".join(struct.pack("ii", *o) for o in str_offsets)
    out += ids + strs
    path.write_bytes(out)


def main() -> int:
    for po in sorted(LOCALE_DIR.glob("*/LC_MESSAGES/*.po")):
        mo = po.with_suffix(".mo")
        entries = parse_po(po)
        write_mo(entries, mo)
        print(f"{po.relative_to(LOCALE_DIR)} → {mo.name} ({len(entries) - 1} messages)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
