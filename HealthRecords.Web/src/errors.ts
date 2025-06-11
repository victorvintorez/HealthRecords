export class UnauthorizedError extends Error {
	constructor() {
		super("Unauthorized")
		this.name = "UnauthorizedError"
	}
}

export class NotFoundError extends Error {
	constructor() {
		super("Not Found")
		this.name = "NotFoundError"
	}
}

export class ValidationError extends Error {
	constructor(message: string) {
		super(`Validation Error: ${message}`)
		this.name = "ValidationError"
	}
}

export class APIParseError extends Error {
	constructor() {
		super("Failed to parse API response")
		this.name = "APIParseError"
	}
}

export class UnexpectedServerError extends Error {
	constructor(message: string) {
		super(`Unexpected server error: ${message}`)
		this.name = "UnexpectedServerError"
	}
}

export class UnexpectedStatusError extends Error {
	constructor(status: number) {
		super(`Unexpected status: ${status}`)
		this.name = "UnexpectedStatusError"
	}
}