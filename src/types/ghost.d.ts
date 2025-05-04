declare module '@tryghost/content-api' {
  interface GhostContentAPIOptions {
    url: string;
    key: string;
    version: string;
  }

  interface BrowseParams {
    limit?: number;
    page?: number;
    order?: string;
    filter?: string;
    include?: string | string[];
    fields?: string | string[];
    formats?: string | string[];
  }

  interface ReadParams {
    id?: string;
    slug?: string;
    include?: string | string[];
    fields?: string | string[];
    formats?: string | string[];
  }

  interface PostsAPI {
    browse(params?: BrowseParams): Promise<any[]>;
    read(params: ReadParams): Promise<any>;
  }

  interface TagsAPI {
    browse(params?: BrowseParams): Promise<any[]>;
    read(params: ReadParams): Promise<any>;
  }

  interface AuthorsAPI {
    browse(params?: BrowseParams): Promise<any[]>;
    read(params: ReadParams): Promise<any>;
  }

  interface PagesAPI {
    browse(params?: BrowseParams): Promise<any[]>;
    read(params: ReadParams): Promise<any>;
  }

  interface SettingsAPI {
    browse(): Promise<any>;
  }

  interface GhostAPI {
    posts: PostsAPI;
    tags: TagsAPI;
    authors: AuthorsAPI;
    pages: PagesAPI;
    settings: SettingsAPI;
  }

  export default function GhostContentAPI(options: GhostContentAPIOptions): GhostAPI;
}
