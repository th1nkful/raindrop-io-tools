# raindrop-io-tools
Automatically add read time onto bookmarks in Raindrop.io

## Configurations
RAINDROP_TOKEN="<from_raindrop_website_dev_section>"

RAINDROP_COLLECTION="-1" // This is the unsorted system collection

CONFIG_WPM="250"

CONFIG_TAG_PREFIX="time-" // Will prefix this onto the time, ie time-10mins, used to detect if the time has been calculated for this droplet or not

CONFIG_SCHEDULE="0 0 * * * *" // Default will run hourly