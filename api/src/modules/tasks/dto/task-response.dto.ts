export class TaskResponseDto {
  id!: string;
  title!: string;
  description!: string | null;
  status!: string;
  userId!: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}
