export enum WorkspaceType {
  Individual = 0,
  Team = 1,
}

export enum TeamRole {
  Owner = 0,
  Admin = 1,
  Member = 2,
}

export enum InvitationStatus {
  Pending = 0,
  Accepted = 1,
  Declined = 2,
  Expired = 3,
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userIcon: string | null;
  role: TeamRole;
  joinedAt: string;
  lastAccessAt: string | null;
  isActive: boolean;
}

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  workspaceName: string;
  email: string;
  invitedByUserName: string;
  role: TeamRole;
  status: InvitationStatus;
  createdAt: string;
  expiresAt: string;
  invitationToken: string | null;
}

export interface WorkspaceTeam {
  workspaceId: string;
  workspaceName: string;
  type: WorkspaceType;
  maxMembers: number;
  currentMembers: number;
  members: WorkspaceMember[];
  pendingInvitations: WorkspaceInvitation[];
}

export interface AddMemberDto {
  userId: string;
  role: TeamRole;
}

export interface UpdateMemberRoleDto {
  role: TeamRole;
}

export interface InviteMemberDto {
  email: string;
  role: TeamRole;
}

export interface GroupPermission {
  id: string;
  groupId: string;
  groupName: string;
  userId: string;
  userName: string;
  userEmail: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManagePages: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SetGroupPermissionDto {
  groupId: string;
  userId: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManagePages: boolean;
}

export interface UpgradeWorkspaceDto {
  maxMembers: number;
}
