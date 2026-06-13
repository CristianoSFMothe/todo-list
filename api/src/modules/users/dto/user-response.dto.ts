export class UserResponseDto {
  id!: string;
  name!: string;
  email!: string;
  tasks?: {
    id: string;
    title: string;
    description: string | null;
    status: string;
  }[];
}
