STAGE_TEMPLATES = {
    "No DR": {
        "findings": "No signs of diabetic retinopathy detected.",
        "next_steps": [
            "Routine eye check every 12 months",
            "Maintain stable blood glucose level"
        ],
        "diet": {
            "good": ["Balanced diet", "Leafy greens", "Whole grains"],
            "avoid": ["Excess sugar", "Processed snacks"]
        },
        "exercise": [
            "At least 150 minutes light activity weekly",
            "Regular walking or stretching"
        ],
        "prevention": [
            "Annual eye screening",
            "Monitor blood sugar regularly"
        ]
    },

    "Mild": {
        "findings": "Mild non-proliferative diabetic retinopathy detected.",
        "next_steps": [
            "Follow-up every 6–12 months",
            "Improve glucose control"
        ],
        "diet": {
            "good": ["Omega-3 fish", "Vegetables", "Low GI food"],
            "avoid": ["Sugary drinks", "High carbohydrate snacks"]
        },
        "exercise": [
            "Moderate exercise 150 minutes per week",
            "Light strength training"
        ],
        "prevention": [
            "Regular eye monitoring",
            "Control blood pressure"
        ]
    },

    "Moderate": {
        "findings": "Moderate diabetic retinopathy detected.",
        "next_steps": [
            "Consult ophthalmologist within 3 months",
            "Retinal imaging follow-up required"
        ],
        "diet": {
            "good": ["High fiber food", "Lean protein", "Green vegetables"],
            "avoid": ["Fried food", "Sweet desserts"]
        },
        "exercise": [
            "Regular walking or cycling",
            "Avoid intense exercise if unstable glucose"
        ],
        "prevention": [
            "Strict sugar monitoring",
            "Eye exam every 6 months"
        ]
    },

    "Severe": {
        "findings": "Severe diabetic retinopathy detected.",
        "next_steps": [
            "Immediate ophthalmologist appointment",
            "Possible treatment discussion",
            "Retinal imaging follow-up"
        ],
        "diet": {
            "good": ["Leafy greens", "Omega-3 rich fish", "Whole grains"],
            "avoid": ["Sugary foods", "Sweetened drinks", "Fried food"]
        },
        "exercise": [
            "Moderate physical activity weekly",
            "Avoid high-intensity exercise"
        ],
        "prevention": [
            "Frequent eye examinations",
            "Strict glucose control",
            "Avoid smoking"
        ]
    },

    "Proliferative": {
        "findings": "Proliferative diabetic retinopathy detected.",
        "next_steps": [
            "Urgent specialist referral",
            "Possible laser or surgical treatment"
        ],
        "diet": {
            "good": ["Low sugar diet", "High fiber vegetables"],
            "avoid": ["All refined sugars", "High fat food"]
        },
        "exercise": [
            "Light exercise only",
            "Avoid strain or heavy lifting"
        ],
        "prevention": [
            "Immediate medical supervision",
            "Frequent retinal monitoring"
        ]
    }
}