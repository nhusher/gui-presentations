// A stupid trick for padding strings:
function pad(str, size) {
    var pad = Math.max(size - str.length + 1, 0);
    return str + (new Array(pad).join('&nbsp;'));
}

// Print a list of users to the console in a formatted way:
function printToConsole(userList) {
    userList.sort(function (a, b) {
        var aName = (a.name || a.login).toLowerCase(),
            bName = (b.name || b.login).toLowerCase();

        return (aName < bName) ? -1 : 1;
    });

    userList.forEach(function (user) {
        var name  = pad( user.name || user.login,       25),
            gists = pad( 'Gists: ' + user.public_gists, 15),
            repos = 'Repos: ' + user.public_repos;

        console.log(name + gists + repos);
    });
}

function getListOfUsers (fulfill) {
    
    // ajax is a wrapper for XMLHttpRequest
    ajax(
        // that takes a URL
        "https://api.github.com/orgs/dealerdotcom/members",
        
        // and a callback
        function (error, success) {
            fulfill(JSON.parse(success.responseText));
        }
    );
    
}

function getEachUsersInfo (members) {
    return Promise(function (fulfill) {
        var remainingUsers = members.length,
            userInfo = [];

        members.forEach(function (member) {
            ajax(
                'https://api.github.com/users/' + member.login,
                
                function (errors, result) {
                    userInfo.push(result);
                    remainingUsers -= 1;
                        
                    if(remainingUsers === 0) {
                        fulfill(userInfo);
                    }
                }
            );
        });
    });
})

