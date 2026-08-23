export interface PaymentData {

    cardHolderName: string;

    cardNumber: string;

    expiryMonth: string;

    expiryYear: string;

    cvv: string;

    amount: number;

}

// For real projects, do not put real card credentials or sensitive production data into this repository. These are only structural examples.