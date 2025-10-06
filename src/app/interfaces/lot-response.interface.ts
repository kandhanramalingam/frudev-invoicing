export interface LotListItem {
    id: number
    mainlotno: string
    description: string
    price: string
    sum_total: number
    VMStatus: string
    firstName: string
    lastName: string
    userid: number
    auction_id: number
}

export interface InvoiceResponse {
    configs: InvoiceConfigs
    lotDetails: InvoiceLotDetail[]
    summaryDetails: any[]
}

export interface InvoiceConfigs {
    vat: string
    awa_contact: string
    bank_detail: string
}

export interface InvoiceLotDetail {
    Lot: string
    Buyer: number
    Item: string
    M: number
    F: number
    T: number
    Amount: number
    Total: number
    Vat: number
}