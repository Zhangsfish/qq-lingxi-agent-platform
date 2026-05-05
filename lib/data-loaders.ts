import fs from "node:fs/promises";
import path from "node:path";
import {
  ContentItemListSchema,
  type ContentItem,
} from "@/lib/content-schema";
import {
  GroupProfileListSchema,
  type GroupProfile,
} from "@/lib/group-schema";
import {
  PersonProfileListSchema,
  type PersonProfile,
} from "@/lib/person-schema";

async function readJsonFile(filePath: string) {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content) as unknown;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to read data file ${filePath}: ${message}`);
  }
}

export async function loadGroups(): Promise<GroupProfile[]> {
  const filePath = path.join(process.cwd(), "data", "groups.json");
  const data = await readJsonFile(filePath);

  try {
    return GroupProfileListSchema.parse(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Invalid groups data: ${message}`);
  }
}

export async function loadContentItems(): Promise<ContentItem[]> {
  const filePath = path.join(process.cwd(), "data", "content_items.json");
  const data = await readJsonFile(filePath);

  try {
    return ContentItemListSchema.parse(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Invalid content items data: ${message}`);
  }
}

export async function loadPeople(): Promise<PersonProfile[]> {
  const filePath = path.join(process.cwd(), "data", "people.json");
  const data = await readJsonFile(filePath);

  try {
    return PersonProfileListSchema.parse(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Invalid people data: ${message}`);
  }
}

export async function loadGroupsByScene(
  scene: string,
): Promise<GroupProfile[]> {
  const groups = await loadGroups();
  return groups.filter((group) => group.scene === scene);
}

export async function loadContentItemsByScene(
  scene: string,
): Promise<ContentItem[]> {
  const contentItems = await loadContentItems();
  return contentItems.filter((item) => item.scene === scene);
}

export async function loadPeopleByScene(
  scene: string,
): Promise<PersonProfile[]> {
  const people = await loadPeople();
  return people.filter((person) => person.scene === scene);
}

export async function getGroupById(
  id: string,
): Promise<GroupProfile | undefined> {
  const groups = await loadGroups();
  return groups.find((group) => group.id === id);
}

export async function getContentItemById(
  id: string,
): Promise<ContentItem | undefined> {
  const contentItems = await loadContentItems();
  return contentItems.find((item) => item.id === id);
}

export async function getPersonById(
  id: string,
): Promise<PersonProfile | undefined> {
  const people = await loadPeople();
  return people.find((person) => person.id === id);
}

export async function loadContentItemsByAuthor(
  authorProfileId: string,
): Promise<ContentItem[]> {
  const contentItems = await loadContentItems();
  return contentItems.filter(
    (item) => item.author_profile_id === authorProfileId,
  );
}
