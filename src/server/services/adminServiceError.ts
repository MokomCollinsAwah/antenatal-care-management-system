export class AdminServiceError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "DUPLICATE"
      | "INVALID_ID"
      | "NOT_FOUND"
      | "INVALID_ROLE",
  ) {
    super(message);
    this.name = "AdminServiceError";
  }
}
