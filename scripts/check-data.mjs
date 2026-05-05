import fs from "node:fs";
import path from "node:path";

const EXPECTED_GROUPS = 96;
const EXPECTED_CONTENT_ITEMS = 192;
const EXPECTED_PEOPLE = 64;
const EXPECTED_SCENES = 8;
const EXPECTED_GROUPS_PER_SCENE = 12;
const EXPECTED_CONTENT_PER_SCENE = 24;
const EXPECTED_PEOPLE_PER_SCENE = 8;

const rootDir = process.cwd();
const groupsPath = path.join(rootDir, "data", "groups.json");
const contentItemsPath = path.join(rootDir, "data", "content_items.json");
const peoplePath = path.join(rootDir, "data", "people.json");

function fail(message) {
  console.error(`Data check failed: ${message}`);
  process.exit(1);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (error) {
    fail(`Cannot parse ${filePath}: ${error.message}`);
  }
}

function countByScene(items) {
  return items.reduce((counts, item) => {
    counts.set(item.scene, (counts.get(item.scene) ?? 0) + 1);
    return counts;
  }, new Map());
}

function assertUnique(items, fieldName, label) {
  const seen = new Set();
  for (const item of items) {
    const id = item[fieldName];
    if (seen.has(id)) {
      fail(`Duplicate ${label} id: ${id}`);
    }
    seen.add(id);
  }
  return seen;
}

function walkStrings(value, pathLabel, visit) {
  if (typeof value === "string") {
    visit(value, pathLabel);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      walkStrings(item, `${pathLabel}[${index}]`, visit),
    );
    return;
  }

  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      walkStrings(item, `${pathLabel}.${key}`, visit);
    }
  }
}

function assertNoInvalidText(items, label) {
  for (const [index, item] of items.entries()) {
    walkStrings(item, `${label}[${index}]`, (value, pathLabel) => {
      if (value.includes("?") || value.includes("????") || value.includes("�")) {
        fail(`invalid replacement text at ${pathLabel}`);
      }
    });
  }
}

const groups = readJson(groupsPath);
const contentItems = readJson(contentItemsPath);
const people = readJson(peoplePath);

if (!Array.isArray(groups)) fail("groups.json must be an array");
if (!Array.isArray(contentItems)) fail("content_items.json must be an array");
if (!Array.isArray(people)) fail("people.json must be an array");

if (groups.length !== EXPECTED_GROUPS) {
  fail(`groups count expected ${EXPECTED_GROUPS}, got ${groups.length}`);
}

if (contentItems.length !== EXPECTED_CONTENT_ITEMS) {
  fail(
    `content_items count expected ${EXPECTED_CONTENT_ITEMS}, got ${contentItems.length}`,
  );
}

if (people.length !== EXPECTED_PEOPLE) {
  fail(`people count expected ${EXPECTED_PEOPLE}, got ${people.length}`);
}

const groupSceneCounts = countByScene(groups);
const contentSceneCounts = countByScene(contentItems);
const peopleSceneCounts = countByScene(people);
const sceneSet = new Set([
  ...groupSceneCounts.keys(),
  ...contentSceneCounts.keys(),
  ...peopleSceneCounts.keys(),
]);

if (sceneSet.size !== EXPECTED_SCENES) {
  fail(`scene count expected ${EXPECTED_SCENES}, got ${sceneSet.size}`);
}

for (const scene of sceneSet) {
  const groupCount = groupSceneCounts.get(scene) ?? 0;
  const contentCount = contentSceneCounts.get(scene) ?? 0;
  const peopleCount = peopleSceneCounts.get(scene) ?? 0;

  if (groupCount !== EXPECTED_GROUPS_PER_SCENE) {
    fail(
      `scene ${scene} groups count expected ${EXPECTED_GROUPS_PER_SCENE}, got ${groupCount}`,
    );
  }

  if (contentCount !== EXPECTED_CONTENT_PER_SCENE) {
    fail(
      `scene ${scene} content_items count expected ${EXPECTED_CONTENT_PER_SCENE}, got ${contentCount}`,
    );
  }

  if (peopleCount !== EXPECTED_PEOPLE_PER_SCENE) {
    fail(
      `scene ${scene} people count expected ${EXPECTED_PEOPLE_PER_SCENE}, got ${peopleCount}`,
    );
  }
}

const groupIds = assertUnique(groups, "id", "group");
const contentIds = assertUnique(contentItems, "id", "content");
const personIds = assertUnique(people, "id", "person");

const groupsById = new Map(groups.map((group) => [group.id, group]));
const contentById = new Map(contentItems.map((content) => [content.id, content]));
const peopleById = new Map(people.map((person) => [person.id, person]));

for (const group of groups) {
  if (!Array.isArray(group.culture_tags) || group.culture_tags.length !== 8) {
    fail(`group ${group.id} culture_tags.length must be 8`);
  }

  if (!Array.isArray(group.content_assets) || group.content_assets.length !== 2) {
    fail(`group ${group.id} content_assets.length must be 2`);
  }

  for (const contentId of group.content_assets) {
    if (!contentIds.has(contentId)) {
      fail(`group ${group.id} references missing content ${contentId}`);
    }
  }
}

for (const content of contentItems) {
  if (
    !Array.isArray(content.linked_group_ids) ||
    content.linked_group_ids.length !== 1
  ) {
    fail(`content ${content.id} linked_group_ids.length must be 1`);
  }

  if (!content.author_profile_id) {
    fail(`content ${content.id} missing author_profile_id`);
  }

  if (!personIds.has(content.author_profile_id)) {
    fail(
      `content ${content.id} references missing author ${content.author_profile_id}`,
    );
  }

  for (const groupId of content.linked_group_ids) {
    if (!groupIds.has(groupId)) {
      fail(`content ${content.id} references missing group ${groupId}`);
    }
  }
}

for (const person of people) {
  if (!Array.isArray(person.linked_group_ids)) {
    fail(`person ${person.id} linked_group_ids must be an array`);
  }

  if (!Array.isArray(person.authored_content_ids)) {
    fail(`person ${person.id} authored_content_ids must be an array`);
  }

  if (person.authored_content_ids.length < 1) {
    fail(`person ${person.id} must author at least 1 content item`);
  }

  if (person.authored_content_ids.length > 5) {
    fail(`person ${person.id} must author at most 5 content items`);
  }

  for (const groupId of person.linked_group_ids) {
    const group = groupsById.get(groupId);
    if (!group) {
      fail(`person ${person.id} references missing group ${groupId}`);
    }

    if (group.scene !== person.scene) {
      fail(`person ${person.id} references cross-scene group ${groupId}`);
    }
  }

  for (const contentId of person.authored_content_ids) {
    const content = contentById.get(contentId);
    if (!content) {
      fail(`person ${person.id} references missing content ${contentId}`);
    }

    if (content.author_profile_id !== person.id) {
      fail(
        `person ${person.id} authored content ${contentId} is not bidirectional`,
      );
    }
  }
}

for (const group of groups) {
  for (const contentId of group.content_assets) {
    const content = contentById.get(contentId);
    if (!content.linked_group_ids.includes(group.id)) {
      fail(`group ${group.id} -> content ${contentId} is not bidirectional`);
    }
  }
}

for (const content of contentItems) {
  for (const groupId of content.linked_group_ids) {
    const group = groupsById.get(groupId);
    if (!group.content_assets.includes(content.id)) {
      fail(`content ${content.id} -> group ${groupId} is not bidirectional`);
    }
  }

  const person = peopleById.get(content.author_profile_id);
  if (!person.authored_content_ids.includes(content.id)) {
    fail(
      `content ${content.id} -> author ${content.author_profile_id} is not bidirectional`,
    );
  }
}

assertNoInvalidText(groups, "groups");
assertNoInvalidText(contentItems, "content_items");
assertNoInvalidText(people, "people");

console.log("Data check passed.");
console.log(`groups=${groups.length}`);
console.log(`content_items=${contentItems.length}`);
console.log(`people=${people.length}`);
