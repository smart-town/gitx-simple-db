export const issueApi: Record<string, Array<string>> = {
    "all": ["/repos/{owner}/{repo}/issues", "GET"],
    "one": ["/repos/{owner}/{repo}/issues/{number}", "GET"],
    "create": ["/repos/{owner}/issues", "POST"],
    "update": ["/repos/{owner}/issues/{number}", "PATCH"],
    "repoAllComments": ["/repos/{owner}/{repo}/issues/{number}/comments", "GET"],
    "addComments": ["/repos/{owner}/{repo}/issues/{number}/comments", "POST"],
    "getComments": ["/repos/{owner}/{repo}/issues/comments/{id}", "GET"],
    "updateComments": ["/repos/{owner}/{repo}/issues/comments/{id}", "PATCH"],
    "delComments": ["/repos/{owner}/{repo}/issues/comments/{id}", "DELETE"],
    "getOwnComments": ["/issues", "GET"],
}

export const githubIssueApi: Record<string, Array<string>> = {
    "all": ["/repos/{owner}/{repo}/issues", "GET"],
    "one": ["/repos/{owner}/{repo}/issues/{number}", "GET"],
    "create": ["/repos/{owner}/{repo}/issues", "POST"],
    "update": ["/repos/{owner}/{repo}/issues/{number}", "PATCH"],
    "repoAllComments": ["/repos/{owner}/{repo}/issues/{number}/comments", "GET"],
    "addComments": ["/repos/{owner}/{repo}/issues/{number}/comments", "POST"],
    "getComments": ["/repos/{owner}/{repo}/issues/comments/{id}", "GET"],
    "updateComments": ["/repos/{owner}/{repo}/issues/comments/{id}", "PATCH"],
    "delComments": ["/repos/{owner}/{repo}/issues/comments/{id}", "DELETE"],
    "getOwnComments": ["/user/issues", "GET"],
}

const ApiConsts = {
    gitee: issueApi,
    github: githubIssueApi,
}
export default ApiConsts;