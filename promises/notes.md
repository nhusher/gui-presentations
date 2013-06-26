
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
<< REST >>
-- If you're confused, let's look at some code and we can figure this out together.

### Example: Github activity

-- You can see from the first request that we get a lot of data. What if we want to find out how many repos or gists each user has?
-- We have to query each user's profile separately. Lame.

(2)

-- At a high level, these are the steps we want to complete:
---- Get a list of all the users
---- Then get each user's info
---- Then print it to the console.

-- With callback-centric code, it's not easy to do this simply. Remember what I said about intent?
-- Let's run this to see what we get back.
-- Some interesting activity. I'm a bit of an outlier: I *love* gists.
-- Let's tear this apart piece-by-piece.

(3)

-- I wrote a simple wrapper for XMLHttpRequest so we don't have to stare at the guts of a terrible browser API.
-- The important thing here is that getEachUsersInfo doesn't execute until the fulfill method is called on line 10.
-- Whatever you pass to fulfill, will be passed to the next "then" function.

(4)

-- If we remember back from the beginning -- if a then function returns a promise, the chain won't continue to resolve until that promise resolved.
-- Here, we return a promise that wraps over a bunch of ajax requests we make to get each user's info.
-- When we're done, we call fulfill, and the result is passed to printToConsole

(5)

-- And that's everything together.

### Good Job Nick

-- Not that great, right? It's just as bad as doing it the old way.
-- But I'm not wasting your time, I promise. har har.

### Promises + Composition

-- Every promise exposes the same contract, and they're chainable.
-- You can write a few general purpose functions and snap them together.
-- Most of the code I've shown you is syntactic trash: it's boilerplate code to munge data through a pipeline
-- Introducing, json and batch: two simple promises that makes 30 lines turn into 7.

### json

-- I wrote a simple viewer for Eve Online data.
-- json takes a url and returns a promise that will resolve when we get JSON data back
-- We get back the name and description in markdown

### batch

-- This is where things get a little interesting.
-- batch takes an array of promises and resolves when all of those promises have resolved.
-- generates an array and writes the data into that array as the promises resolve
-- when all are resolved, it fulfills against the array of results
-- and you can see below, we just snap some json promise functions in there

### Example: Github activity

-- We've improved our toolbox, and now we can run the simplified code.

### The next step...

-- There's more we can do, though.
-- Calling Promise.then gets really tiresome after a while
-- What if we know the response we will get back is a list. Or list like?
-- If we could operate on the promise like we would on a list, it would make our code simpler.

### Enter ListPromise

-- I'm not going to provide an implementation, except to say that there is one, and it's very simple.
-- Syntax here is based off of TypeScript
-- ListPromise should have the same contract as Promise, but chain a ListPromise
-- It should also have array operations like map, reduce, sort, filter, etc.
-- And we should extend the regular Promise with a "toList" method.



