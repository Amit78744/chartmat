const CHARTMAT_PLANS = {
    free: {
        allowed_workspaces: 1,
        allowed_user_per_workspace: 1,
    },
    lite: {
        allowed_workspaces: 1,
        allowed_user_per_workspace: 2
    },
    pro: {
        allowed_workspaces: 5,
        allowed_user_per_workspace: 5
    },
    business: {
        allowed_workspaces: Number.MAX_SAFE_INTEGER,
        allowed_user_per_workspace: Number.MAX_SAFE_INTEGER
    },
    chartmat_tier1: { allowed_workspaces: 1, allowed_user_per_workspace: Number.MAX_SAFE_INTEGER },
    chartmat_tier2: { allowed_workspaces: 3, allowed_user_per_workspace: Number.MAX_SAFE_INTEGER },
    chartmat_tier3: { allowed_workspaces: 10, allowed_user_per_workspace: Number.MAX_SAFE_INTEGER },
    chartmat_tier4: { allowed_workspaces: 25, allowed_user_per_workspace: Number.MAX_SAFE_INTEGER },
    chartmat_tier5: { allowed_workspaces: 100, allowed_user_per_workspace: Number.MAX_SAFE_INTEGER }
}

const LIFETIME_PLAN = [
    { plan: 'Lite', allowed_workspaces: 1, allowed_user_per_workspace: 5 },
    { plan: 'Pro', allowed_workspaces: 3, allowed_user_per_workspace: 15 },
    { plan: 'Pro Plus', allowed_workspaces: 10, allowed_user_per_workspace: Number.MAX_SAFE_INTEGER },
    { plan: 'Pro Max', allowed_workspaces: 25, allowed_user_per_workspace: Number.MAX_SAFE_INTEGER },
    { plan: 'Enterprise', allowed_workspaces: 100, allowed_user_per_workspace: Number.MAX_SAFE_INTEGER }
]

const CHARTMAT_LIFETIME_PLAN = {
    lite_lifetime: { plan: 'Lite', allowed_workspaces: 1, allowed_user_per_workspace: 5 },
    pro_lifetime: { plan: 'Pro', allowed_workspaces: 3, allowed_user_per_workspace: 15 },
    proplus_lifetime: { plan: 'Pro Plus', allowed_workspaces: 10, allowed_user_per_workspace: Number.MAX_SAFE_INTEGER },
    promax_lifetime: { plan: 'Pro Max', allowed_workspaces: 25, allowed_user_per_workspace: Number.MAX_SAFE_INTEGER },
    enterprise_lifetime: { plan: 'Enterprise', allowed_workspaces: 100, allowed_user_per_workspace: Number.MAX_SAFE_INTEGER }
}



module.exports = {
    CHARTMAT_PLANS,
    LIFETIME_PLAN,
    CHARTMAT_LIFETIME_PLAN
}