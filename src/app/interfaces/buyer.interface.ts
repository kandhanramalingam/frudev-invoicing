export interface Buyer {
    buyer_info_status: string
    bidno: number
    firstName: string
    lastName: string
    buyer_id: string
    value_allowed: number
    allLotsInvoiced?: boolean
}