if [[ -z "$DELAY" ]]; then
    DELAY=1000
fi

while :
do
    rclone --config /data/rclone.conf move /backup BACKUP: -v --ignore-existing
    sleep $DELAY
done
