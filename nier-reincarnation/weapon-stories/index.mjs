import 'dotenv/config';
import { NIERREIN_GUIDE_API_URL, NIERREIN_GUIDE_CDN_URL, WEAPON_TYPES_RELATION_IDS } from '../../config.mjs';
import { env } from '../../env.mjs';

let currentIndex = 1;

let weapons = [];

try {
  console.log('Fetching NieR Re[in]carnation weapons...')
  weapons = await fetch(`${NIERREIN_GUIDE_API_URL}/weapons`)
    .then((response) => response.json())
} catch (error) {
  console.error(error)
  process.exit(1);
}

console.log(`${weapons.length} weapons fetched from "${NIERREIN_GUIDE_API_URL}/weapons"`)

if (weapons.length === 0) {
  console.error(`Got 0 weapons from "${NIERREIN_GUIDE_API_URL}/weapons". Their database is probably in the process of being updated. Try again in 10 minutes.`)
  process.exit(1);
}

for (const weapon of weapons) {
  console.log(`Uploading n°${currentIndex}/${weapons.length} weapons.`);

  // Get weapon image blob for the thumbnail
  const file = await fetch(`${NIERREIN_GUIDE_CDN_URL}${weapon.image_path}full.png`).then(
    (response) => response.blob()
  );

  const body = new FormData();

  // Create the weapon-stories entry
  body.append(
    "data",
    JSON.stringify({
      slug: weapon.slug,
      name: [
        {
          name: weapon.name,
          language: {
            connect: [2], // en
          },
        },
      ],
      stories: [
        {
          categories: {
            connect: [8], // nier reincarnation
          },
          translations: [
            {
              language: {
                connect: [2], // en
              },
              status: "Done",
              level_1:
                weapon.weapon_story_link[0].weapon_story.story?.replaceAll(
                  "\\n",
                  "<br>"
                ),
              level_2:
                weapon.weapon_story_link[1].weapon_story.story?.replaceAll(
                  "\\n",
                  "<br>"
                ),
              level_3:
                weapon.weapon_story_link[2].weapon_story.story?.replaceAll(
                  "\\n",
                  "<br>"
                ),
              level_4:
                weapon.weapon_story_link[3].weapon_story.story?.replaceAll(
                  "\\n",
                  "<br>"
                ),
            },
          ],
        },
      ],
      categories: {
        connect: [8], // nier reincarnation
      },
      type: {
        connect: [WEAPON_TYPES_RELATION_IDS[weapon.weapon_type]], // weapon type
      },
    })
  );

  // Add the weapon image blob
  body.append("files.thumbnail", file, `${weapon.slug}.png`);

  const response = await fetch(
    `${env.STRAPI_BASE_API_URL}/weapon-stories`,
    {
      method: "POST",
      body,
      headers: {
        Authorization:
          `bearer ${env.STRAPI_API_TOKEN}`,
      },
    }
  )
    .then((res) => res.json())
    .catch((err) => err?.json());

  if (response?.error) {
    if (response.error.message === "This attribute must be unique") {
      console.warn(
        `[DUPLICATE] ${weapon.name} (${weapon.slug}) already exists.`
      );

      continue
    }

    console.error(`[ERROR] ${weapon.name} (${weapon.slug}):`, response.error.message)
  } else {
    console.log(`[ADDED] "${weapon.name}" (${weapon.slug})`);
  }

  currentIndex++;
}