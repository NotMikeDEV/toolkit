#!/bin/bash
TEMPFILE=$(tempfile)
tshark -w "$TEMPFILE" "$@"
wget --body-file=$TEMPFILE --method=PUT -O "$TEMPFILE.url" -o /dev/null "http://tools.as206671.uk/pcap/$(hostname)/upload" && (
        rm -f "$TEMPFILE"
        URL=$(cat "$TEMPFILE.url"  | python -c "import sys, json; print json.load(sys.stdin)['filename']")
        URL="https://tools.as206671.uk/pcap/captures/$URL"
        echo $URL
) || echo "$TEMPFILE"
