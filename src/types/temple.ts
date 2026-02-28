export interface Temple {
  id: string;
  name: string;
  description: string | null;
  inviteCode: string;
  createdBy: string;
  createdAt: string;
  settings: {
    defaultLanguage?: string;
    allowSongRequests?: boolean;
  };
}

export interface Group {
  id: string;
  templeId: string;
  name: string;
  inviteCode: string;
  createdAt: string;
}

export type MemberRole = 'admin' | 'leader' | 'follower';

export interface Membership {
  id: string;
  userId: string;
  groupId: string;
  role: MemberRole;
  displayName: string;
  joinedAt: string;
}
