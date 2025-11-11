// Collection Types based on API

export type CollectionType = "Magazine" | "Stack";

export interface Page {
  uid: string;
  type: "image" | "text";
  content: string; // Either filename for image or text content
  created_at: string;
}

export interface Collection {
  uid: string;
  name: string;
  description?: string;
  type: CollectionType;
  user_name: string;
  created_at: string;
  cover_image?: string; // First page image or placeholder
}

export interface CollectionWithPages extends Collection {
  pages: Page[];
}

// API Request/Response types

export interface CreateCollectionRequest {
  name: string;
  user_name: string;
  type: CollectionType;
  images: File[];
}

export interface CreateCollectionResponse {
  uid: string;
  name: string;
  type: CollectionType;
  user_name: string;
  created_at: string;
}

export interface AddPageImageRequest {
  image: File;
  user_name: string;
}

export interface AddPageTextRequest {
  text_content: string;
  user_name: string;
}

export interface AddPageResponse {
  uid: string;
  type: "image" | "text";
  image_path?: string;
  text_content?: string;
  order_index: number;
  created_at: string;
}

export interface DeletePageRequest {
  user_name: string;
}

export interface UpdateCollectionNameRequest {
  user_name: string;
  name: string;
  description?: string;
  cover_image?: string;
}

export interface CollectionListItem {
  uid: string;
  name: string;
  description?: string;
  type: CollectionType;
  user_name: string;
  created_at: string;
  cover_image?: string;
  page_count: number;
}
