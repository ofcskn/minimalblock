export interface UserProps {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: Date;
}

export class User {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly avatarUrl?: string;
  readonly createdAt: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.displayName = props.displayName;
    this.avatarUrl = props.avatarUrl;
    this.createdAt = props.createdAt;
  }

  withUpdatedProfile(displayName: string, avatarUrl?: string): User {
    return new User({ ...this, displayName, avatarUrl });
  }
}
