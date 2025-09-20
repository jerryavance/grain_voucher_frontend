import instance from "../../../api"
export const DashboardService = {
    async getDashboardSummary() {
        return instance.get('dashboard/', {
        }).then((response) => response.data)
    },
}

/*
response sample
{
    "active_loans": {
        "total_no": 4,
        "total_os_bal": 10158331.0, //outstanding balance
        "total_pr_bal": 5500000.0, //principal balance
        "total_int_balance": 4658331.0 //interest balance
    },
    "transactions": [
        {
            "t_type": "A",
            "total_amount": 5500000.0
        },
        {
            "t_type": "ASS",
            "total_amount": 6000000.0
        },
        {
            "t_type": "BRTBR",
            "total_amount": 600000.0
        },
        {
            "t_type": "CAD",
            "total_amount": 162000.0
        },
        {
            "t_type": "CAP",
            "total_amount": 390000.0
        },
        {
            "t_type": "D", //deposits
            "total_amount": 629096000.0
        },
        {
            "t_type": "E",
            "total_amount": 750000.0
        },
        {
            "t_type": "FW",
            "total_amount": 100000.0
        },
        {
            "t_type": "LDDF",
            "total_amount": 10000.0
        },
        {
            "t_type": "LPPD",
            "total_amount": 10141666.0
        },
        {
            "t_type": "LPR",
            "total_amount": 31352.0
        },
        {
            "t_type": "R",
            "total_amount": 40000.0
        },
        {
            "t_type": "RE",
            "total_amount": 1620000.0
        },
        {
            "t_type": "W", //withdrawals
            "total_amount": 3125000.0
        },
        {
            "t_type": "WLI",
            "total_amount": 2.0
        }
    ],
    "active_clients": {
        "total_no": 5
    }
}

*/