
## Promises, Promises

-- Promises. What they are, how they can make your life better.

## Why

-- Promises are these really interesting constructs that aren't very well understood.
-- "They look really cool, but I haven't been able to wrap my head around them." 
-- I think part of this is that the examples out there are really terrible
---- Fail to speak directly to the problem a promise is trying to solve.
---- They're often lumped in with events and ajax resolvers.

-- This is going to be a presentation with some code.
---- Boring for the people who already understand the topic, and really confusing for neophytes.
---- It's hard to talk about the **why** without slogging through the **how**; hopefully it isn't too awful.

-- Promises/A+ 
---- Few different specifications out there
---- A+ has a lot of mindshare right now
---- TC-39, the javascript working group, has adopted A+

### What's a promise?

-- Before I get into code, I want to talk about what a promise is more abstractly
-- Forgive me if I'm being pedantic or pontificating.

* A wrapper around an asynchronously-generated value that resolves at a later time.

-- Don't try to unpack this too much, but remember it. 
-- Promises are used to box up all the ugly around working with asynchronicity in javascript.
-- Resolve is an important term, think of it like an asynchronous return.

* Promises make callback programming less painful.

-- We can use promises to avoid nested anonymous function callback hell common to javascript.

* Promises are plumbing that makes it easier to express your program's *intent*.

-- The most important contributor to maintainability isn't unit testing, and it isn't documentation. 
-- **It's writing code that has clear intent.**
-- Stumble on a piece of code, "what is going on here? who wrote this garbage? oh, that was me"

* `Object Oriented Programming : Functional Programming :: Events : Promises`

-- The things that a functional approach tends to be good at, promises also tend to be good at.
---- OOP defines behaviors attached to a data structure.
---- Mutate some shared internal state.
---- Functional programming units define verbs
---- Can be recomposed and chained together.
---- Events expose some internal state by notifying listeners at key moments. 
---- Events are well-defined and are tied to data type.
---- Promises are like functional programming for events.
---- You can use it to bridge data transformations across moments in time.

### No really, what's a promise?

* An object with a method `then`
-- That's it. Well, almost.
-- If you're confused, let's look at some code and we can figure this out together.

### Code

    Promise(getListOfUsers).then(getEachUsersInfo).then(sortAlphabetically).then(printToConsole);

-- I'm going to unpack each step of the chain in reverse order, but here's the high level of what's going on:

    Promise(getListOfUsers).      // Get users from github that are associated with Dealer.com.
        then(getEachUsersInfo).   // Retrieve each user's profile from github.
        then(sortAlphabetically). // Sort the users by name.
        then(printToConsole);     // Print out some information about them.

-- Unpacking the last handler:

    Promise(getListOfUsers).
        then(getEachUsersInfo).
        then(sortAlphabetically).
        
        // printToConsole:
        then(function (userList) {
            userList.forEach(function (user) {
                log(user.name || user.login);
                log('  Gists:', user.public_gists);
                log('  Repos:', user.public_repos);
            });
        });
        
-- The callback here takes a user list, and just prints out some select data in that list. We see the user name and hwo many gists and repos they have.
-- So that's what a promise handler might look like.
-- But how did we get that user list? Let's expand another.

    Promise(getListOfUsers).
        then(getEachUsersInfo).
        
        // sortAlphabetically:
        then(function (unsortedUserList) {

            var sortedUserList = unsortedUserList.sort(function (a, b) {
                var aName = (a.name || a.login).toLowerCase(),
                    bName = (b.name || b.login).toLowerCase();
                
                return (aName < bName) ? 1 : -1;
            });
            
            return sortedUserList; // pass this on to the next handler
        }).
        then(printToConsole);

-- That's pretty straightforward. We get an unsorted list from getEachUsersInfo, however it works, and we sort each element alphabetically. We return the sorted array, which is passed to printToConsole. Cool.

-- How do we get each user's info, though? Let's skip over that for a second and get right to the root:

    Promise(function(fulfill, reject) {

            // see: http://developer.github.com/v3/orgs/members/
            // the get function makes an http request and returns the json response
            get('https://api.github.com/orgs/dealerdotcom/members', function (errors, result) {
                if(errors) {
                    reject(errors); // something bad happened!
                    return;
                }
            
                fulfill(result);
            });

        }).
        then(getEachUsersInfo).
        then(sortAlphabetically).
        then(sortAlphabetically).
        then(printToConsole);

-- The promise handler is handed two resolver methods, fulfill and reject. Fulfill says, "hey, I was successful and here's the result," and reject says the opposite. Whatever value you fulfill with will be passed to the next method in the promise chain.
-- Now let's dig into that getEachUsersInfo method, because there's a lot going on there:

    Promise(getListOfUsers).
        then(function(membersOfDealerDotCom) {
            return Promise(function(fulfill, reject) {
                var remainingUsers = membersOfDealerDotCom.length,
                    unsortedUserList = [];

                membersOfDealerDotCom.forEach(function(member) {
                    get('https://api.github.com/users/' + member.login, function(errors, result) {
                        unsortedUserList.push(result);
                        remainingUsers -= 1;
                
                        if(remainingUsers === 0) {
                            fulfill(unsortedUserList);
                        }
                    });
                });
            });
        }).
        then(sortAlphabetically).
        then(printToConsole);
    
-- Wow. Okay, let's look this over. First, we're returning a promise. This means that functions further down the chain are now waiting on this to be returned. 
-- Then, for each member we found, we go out and get the user data JSON and toss it into a list.
-- When all of the users have been resolved, we call the fulfill function and continue the promise chain.
-- That's pretty complicated, and might make you wonder what the point this promises stuff is.

### Promises + Composition = <3

-- Promises love composition. It's trivially easy to build a new promise-wrapped function that plugs into every other promise seamlessly.
-- At their root, promises only know about two data types: promises, and everything else.
-- Remember, any time you return a promise from a "then" function, the chain waits on that promise to resolve.
-- Otherwise, it just works like a simple pipeline.
-- Let's grab that previous example and think how we can make it smarter:

    Promise(function(fulfill, reject) {

            // see: http://developer.github.com/v3/orgs/members/
            // the get function makes an http request and returns the json response
            get('https://api.github.com/orgs/dealerdotcom/members', function (errors, result) {
                if(errors) {
                    reject(errors); // something bad happened!
                    return;
                }
        
                fulfill(result);
            });

        }).
        then(function(membersOfDealerDotCom) {
            return Promise(function(fulfill, reject) {
                var remainingUsers = membersOfDealerDotCom.length,
                    unsortedUserList = [];

                membersOfDealerDotCom.forEach(function(member) {
                    get('https://api.github.com/users/' + member.login, function(errors, result) {
                        unsortedUserList.push(result);
                        remainingUsers -= 1;
                
                        if(remainingUsers === 0) {
                            fulfill(unsortedUserList);
                        }
                    });
                });
            });
        }).
        then(sortAlphabetically).
        then(printToConsole);

-- Yuck. There's so much syntactical garbage, the intent isn't clear. Let's throw that out, there's no saving it.
-- But what if we wrapped our get function so that it returned a promise...

    function json(url) {
        return Promise(function(fulfill, reject) {
            get(url, function(errors, result) {
                errors ? reject(errors) : fulfill(result);
            });
        });
    }
    
-- Now we have a general purpose "JSON getter" promise. You give it a URL, and it resolves when it receives JSON.
-- And what if we could simplify all that iteration trash in the getEachUsersInfo by using promises?

    function collect(promises) {
        return Promise(function(fulfill, reject) {
            var leftToResolve = promises.length,
                resultList = [];
            
            promises.forEach(function(promise, index) {
                promise.then(function(result) {
                    resultList[i] = result;
                    leftToResolve -= 1;
                    
                    if(leftToResolve === 0) {
                        fulfill(resultList); // All the promises have resolved
                    }
                }, reject);
            });
        });
    }
    
-- That's a little more complex, but collect takes an array of promises and waits for them all to resolve.
-- When they do, it resolves with the results.
-- Now we have two general-purpose promise tools, json, which gets json from some server. And collect, which boxes up a bunch of promises and returns a wrapper round all of them.
-- Let's recombine this with the previous example...

    json('https://api.github.com/orgs/dealerdotcom/members').
    then(function(membersOfDealerDotCom) {
        return collect(membersOfDealerDotCom.map(function(member) {
            return json('https://api.github.com/users/' + member.login);
        }));
    }).
    then(sortAlphabetically).
    then(printToConsole);
    
-- For reals? That works? Totally does.

