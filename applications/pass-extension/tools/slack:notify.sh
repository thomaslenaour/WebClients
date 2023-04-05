CURRENT_TAG=${CI_COMMIT_TAG:-${CI_COMMIT_SHORT_SHA:-$(git rev-parse --short HEAD)}}

# If we're on a gitlab tag commit then get the
# previous one to compute the jira tickets diff
if [ -z $CI_COMMIT_TAG ]; then
    PREVIOUS_TAG=$(git tag -l "proton-pass-extension@*" --sort=-committerdate | sed -n '1p')
else
    PREVIOUS_TAG=$(git tag -l "proton-pass-extension@*" --sort=-committerdate | sed -n '2p')
fi

JIRA_TICKET_IDS=$(git log $PREVIOUS_TAG..$CI_COMMIT_TAG | grep -o "IDTEAM-[0-9]*" | uniq)

echo "Previous tag is : $PREVIOUS_TAG"

if [[ -z $JIRA_TICKET_IDS ]]; then
    echo "No Jira tickets discovered"
else
    echo "Jira tickets discovered"
    echo $JIRA_TICKET_IDS
fi

JIRA_LINKS=()
for ticket in $JIRA_TICKET_IDS; do
    link="https://jira.protontech.ch/secure/RapidBoard.jspa?view=detail&selectedIssue=$ticket"
    section=", {
        \"type\": \"section\",
        \"text\": {
            \"type\": \"mrkdwn\",
            \"text\": \":jira: <$link|[$ticket]>\"
        }
    }"
    JIRA_LINKS+=("$section")
done

SLACK_POST_BODY=$(echo "{
        \"channel\": \"$PASS_EXTENSION_BUILD_SLACK_CHANNEL_ID\",
        \"blocks\": [
            {
                \"type\": \"header\",
                \"text\": {
                \"type\": \"plain_text\",
                \"emoji\": true,
                \"text\": \":protonpass: build $CURRENT_TAG\"
                }
            },
            {
                \"type\": \"section\",
                \"text\": {
                \"type\":\"mrkdwn\",
                \"text\":\"Download the *_unpacked extension_* <https://gitlab.protontech.ch/web/clients/-/jobs/$CI_JOB_ID/artifacts/download|here> (expires in 1 week)\"
                }
            }
            ${JIRA_LINKS[@]}
        ]
    }" | jq -r '.')

curl \
    -X POST https://slack.com/api/chat.postMessage \
    -H "Content-type: application/json; charset=utf-8" \
    -H "Authorization: Bearer ${SIMPLE_LOGIN_SLACK_BOT_TOKEN}" \
    --data-raw "$SLACK_POST_BODY"
