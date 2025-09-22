export type ParsedEvent = {
	summary: string
	uid: string
	start?: string
	end?: string
	created?: string
	description?: unknown
	amount?: number
	event_type?: string
}

export type ParseResult = { events: ParsedEvent[] } | { error: string }
