# BOT Voice Pack Standard

All BOT voices use the same prompt filenames so the site can swap voices without changing the user flow.

## Voice Packs

- GP-BOT: Gregory D. Putnam / default temporary operator voice
- LOID-BOT: Lloyd Miller / music authority voice
- LF-BOT: Lisa / warm support voice
- MC-BOT: Michael Clay / HUG guide voice
- MSJ-BOT: Michael Scherer / jazz aficionado voice
- PIXIE-BOT: Jane Burton / light artful Pixie voice

## Required Prompt Files

Each BOT voice pack should eventually include:

- welcome.m4a
- pick-kind.m4a
- pick-one.m4a
- pick-song.m4a
- live.m4a
- coming-soon.m4a
- try-mothers-day.m4a
- start-hug.m4a
- play-demo.m4a
- choose-hug.m4a
- checkout.m4a

## Folder Pattern

public/voices/{bot-id}/prompts/
public/voices/{bot-id}/source/

## Rule

Do not use fake placeholder AI/browser voices. Use approved real recorded source clips.

## Current Default

GP-BOT is the temporary default voice until MC-BOT is fully recorded and installed.
