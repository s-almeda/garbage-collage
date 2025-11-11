import {
  Collection,
  CollectionWithPages,
  CreateCollectionRequest,
  CreateCollectionResponse,
  AddPageImageRequest,
  AddPageTextRequest,
  AddPageResponse,
  DeletePageRequest,
  UpdateCollectionNameRequest,
  CollectionListItem,
} from "../types/collections";

const API_BASE_URL = "https://art.snailbunny.site/api/collections";

// Helper function to build image URL
export function getImageUrl(filename: string): string {
  return `${API_BASE_URL}/uploads/${filename}`;
}

// Get all collections (admin endpoint)
export async function getAllCollections(): Promise<CollectionListItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/list`);
    if (!response.ok) {
      throw new Error(`Failed to fetch collections: ${response.statusText}`);
    }
    const data = await response.json();
    // API returns { collections: [...] }
    return Array.isArray(data.collections) ? data.collections : [];
  } catch (error) {
    console.error("Error fetching collections:", error);
    return [];
  }
}

// Get single collection with all pages
export async function getCollection(uid: string): Promise<CollectionWithPages> {
  const response = await fetch(`${API_BASE_URL}/${uid}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch collection: ${response.statusText}`);
  }
  const data = await response.json();
  // API returns { collection: {...}, pages: [...] }
  return {
    ...(data.collection || data),
    pages: data.pages || []
  };
}

// Create new collection
export async function createCollection(
  request: CreateCollectionRequest
): Promise<CreateCollectionResponse> {
  const formData = new FormData();
  formData.append("name", request.name);
  formData.append("user_name", request.user_name);
  formData.append("type", request.type);
  
  // Append multiple images
  request.images.forEach((image) => {
    formData.append("images[]", image);
  });

  const response = await fetch(`${API_BASE_URL}/`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to create collection: ${response.statusText}`);
  }
  return response.json();
}

// Add image page to collection
export async function addImagePage(
  collectionUid: string,
  request: AddPageImageRequest
): Promise<AddPageResponse> {
  const formData = new FormData();
  formData.append("image", request.image);
  formData.append("user_name", request.user_name);

  const response = await fetch(`${API_BASE_URL}/${collectionUid}/pages`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to add image page: ${response.statusText}`);
  }
  return response.json();
}

// Add text page to collection
export async function addTextPage(
  collectionUid: string,
  request: AddPageTextRequest
): Promise<AddPageResponse> {
  const response = await fetch(`${API_BASE_URL}/${collectionUid}/pages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to add text page: ${response.statusText}`);
  }
  return response.json();
}

// Delete page from collection
export async function deletePage(
  collectionUid: string,
  pageUid: string,
  request: DeletePageRequest
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/${collectionUid}/pages/${pageUid}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to delete page: ${response.statusText}`);
  }
}

// Update collection name
export async function updateCollectionName(
  collectionUid: string,
  request: UpdateCollectionNameRequest
): Promise<Collection> {
  const response = await fetch(`${API_BASE_URL}/${collectionUid}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to update collection name: ${response.statusText}`);
  }
  return response.json();
}
