if [[ -z "$DELAY" ]]; then
    DELAY=1000
fi

while :
do
    sleep $DELAY
    rclone --config /data/rclone.conf move /backup BACKUP: -v --ignore-existing
done
