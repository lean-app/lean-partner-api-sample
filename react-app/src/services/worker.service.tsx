import { addEntities, setActiveId, UIEntitiesRef, updateEntities } from "@ngneat/elf-entities";
import { toast } from "react-toastify";
import { ulid } from "ulid";

import WorkerStore from "../stores/worker.store";
import { Worker } from "../types/Worker";

import Lean, { GET_CUSTOMER } from "./lean.service";

import { Temporal } from '@js-temporal/polyfill';

const names = ["people", "history", "way", "art", "world", "information", "map", "family", "government", "health", "system", "computer", "meat", "year", "thanks", "music", "person", "reading", "method", "data", "food", "understanding", "theory", "law", "bird", "literature", "problem", "software", "control", "knowledge", "power", "ability", "economics", "love", "internet", "television", "science", "library", "nature", "fact", "product", "idea", "temperature", "investment", "area", "society", "activity", "story", "industry", "media", "thing", "oven", "community", "definition", "safety", "quality", "development", "language", "management", "player", "variety", "video", "week", "security", "country", "exam", "movie", "organization", "equipment", "physics", "analysis", "policy", "series", "thought", "basis", "boyfriend", "direction", "strategy", "technology", "army", "camera", "freedom", "paper", "environment", "child", "instance", "month", "truth", "marketing", "university", "writing", "article", "department", "difference", "goal", "news", "audience", "fishing", "growth", "income", "marriage", "user", "combination", "failure", "meaning", "medicine", "philosophy", "teacher", "communication", "night", "chemistry", "disease", "disk", "energy", "nation", "road", "role", "soup", "advertising", "location", "success", "addition", "apartment", "education", "math", "moment", "painting", "politics", "attention", "decision", "event", "property", "shopping", "student", "wood", "competition", "distribution", "entertainment", "office", "population", "president", "unit", "category", "cigarette", "context", "introduction", "opportunity", "performance", "driver", "flight", "length", "magazine", "newspaper", "relationship", "teaching", "cell", "dealer", "debate", "finding", "lake", "member", "message", "phone", "scene", "appearance", "association", "concept", "customer", "death", "discussion", "housing", "inflation", "insurance", "mood", "woman", "advice", "blood", "effort", "expression", "importance", "opinion", "payment", "reality", "responsibility", "situation", "skill", "statement", "wealth", "application", "city", "county", "depth", "estate", "foundation", "grandmother", "heart", "perspective", "photo", "recipe", "studio", "topic", "collection", "depression", "imagination", "passion", "percentage", "resource", "setting", "ad", "agency", "college", "connection", "criticism", "debt", "description", "memory", "patience", "secretary", "solution", "administration", "aspect", "attitude", "director", "personality", "psychology", "recommendation", "response", "selection", "storage", "version", "alcohol", "argument", "complaint", "contract", "emphasis", "highway", "loss", "membership", "possession", "preparation", "steak", "union", "agreement", "cancer", "currency", "employment", "engineering", "entry", "interaction", "limit", "mixture", "preference", "region", "republic", "seat", "tradition", "virus", "actor", "classroom", "delivery", "device", "difficulty", "drama", "election", "engine", "football", "guidance", "hotel", "match", "owner", "priority", "protection", "suggestion", "tension", "variation", "anxiety", "atmosphere", "awareness", "bread", "climate", "comparison", "confusion", "construction", "elevator", "emotion", "employee", "employer", "guest", "height", "leadership", "mall", "manager", "operation", "recording", "respect", "sample", "transportation", "boring", "charity", "cousin", "disaster", "editor", "efficiency", "excitement", "extent", "feedback", "guitar", "homework", "leader", "mom", "outcome", "permission", "presentation", "promotion", "reflection", "refrigerator", "resolution", "revenue", "session", "singer", "tennis", "basket", "bonus", "cabinet", "childhood", "church", "clothes", "coffee", "dinner", "drawing", "hair", "hearing", "initiative", "judgment", "lab", "measurement", "mode", "mud", "orange", "poetry", "police", "possibility", "procedure", "queen", "ratio", "relation", "restaurant", "satisfaction", "sector", "signature", "significance", "song", "tooth", "town", "vehicle", "volume", "wife", "accident", "airport", "appointment", "arrival", "assumption", "baseball", "chapter", "committee", "conversation", "database", "enthusiasm", "error", "explanation", "farmer", "gate", "girl", "hall", "historian", "hospital", "injury", "instruction", "maintenance", "manufacturer", "meal", "perception", "pie", "poem", "presence", "proposal", "reception", "replacement", "revolution", "river", "son", "speech", "tea", "village", "warning", "winner", "worker", "writer", "assistance", "breath", "buyer", "chest", "chocolate", "conclusion", "contribution", "cookie", "courage", "desk", "drawer", "establishment", "examination", "garbage", "grocery", "honey", "impression", "improvement", "independence", "insect", "inspection", "inspector", "king", "ladder", "menu", "penalty", "piano", "potato", "profession", "professor", "quantity", "reaction", "requirement", "salad", "sister", "supermarket", "tongue", "weakness", "wedding", "affair", "ambition"];
const nameForWorker = (data: Worker) => ((data.firstName && data.lastName) ? `${data.firstName} ${data.middleName ? `${data.middleName} ${data.lastName}` : ` ${data.lastName}`}` : data.name);

export const createWorker = (partialWorker: Partial<Worker>) => {
  const id = ulid();
  const worker = {
    name: '',
    paymentMethod: '',
    email: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    phoneNumber: '',
    birthday: '',
    ...partialWorker,

    id,
    status: 'NEW',
    updatedAt: Temporal.Now.plainDateTimeISO().toString(),
  };

  WorkerStore.update(addEntities(worker));
  return worker;
}

export const invite = async (worker: Worker) => {
  if (worker.status.toUpperCase() !== 'NEW') {
    throw new Error('Worker already invited.')
  }

  WorkerStore.update(setActiveId(worker.id));
}

export const tryCreateWorkerToInvite = () => {
  const hasUsersToOnboard = Object.values(WorkerStore.getValue().entities).filter(({ status }) => status === 'NEW').length > 0;
  if (hasUsersToOnboard) {
    return;
  }

  const { id } = createWorker(({
    name: 'Space Rideshare Worker',
    paymentMethod: 'bank_account',
    street: 'residential house',
    city: 'Los Angeles',
    state: 'CA',
    postalCode: '90000',
    phoneNumber: `${`${Math.random()}`.substring(2, 5)}-${`${Math.random()}`.substring(2, 5)}-${`${Math.random()}`.substring(2, 6)}`,
    birthday: '1990-09-19',
    status: 'NEW',
    invited: false
  }));

  WorkerStore.update(updateEntities(id, (entity) => ({
    ...entity,
    name: `${names[Math.floor(Math.random() * names.length)]} ${names[Math.floor((1 - Math.random()) * names.length)]}`,
    email: `grant+${id}@withlean.com`
  })));
};

export const refresh = async (worker: Worker) => {
  WorkerStore.update(
    updateEntities(worker.id, {
      refreshing: true
    }, { ref: UIEntitiesRef }));

  const { status, data } = await Lean.perform({
    type: GET_CUSTOMER,
    params: worker.id
  });
  
  if (status !== 200) {
    toast(data.message);

    WorkerStore.update(updateEntities(worker.id, {
      refreshing: false
    }, { ref: UIEntitiesRef }));

    return;
  }

  WorkerStore.update(
    updateEntities(worker.id, {
      refreshing: false
    }, { ref: UIEntitiesRef }),
    updateEntities(worker.id, (entity) => {
      if (data.status === 'ACTIVE' && entity.paymentMethod !== 'lean') {
        entity.paymentMethod = 'lean';
      }

      return { ...entity, ...data,
        name: nameForWorker({ ...entity, ...data }),
      };
    })
  );

  toast("Worker refreshed!");
};