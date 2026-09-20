/* 
Purpose: Act as an API developer and create a new Promise to either Resolve or reject
*/

async function fetch_game(){
    new Promise((resolve, reject) => {
        let isRegistered = true
        setTimeout(()=> {
            if(isRegistered){
                const gameJSON = {
                    monday: "leafs",
                    tuesday: "raptors"
                }
                // Static method that comes from the JSON prototype/class
                let gamesJSONstr = JSON.stringify(gamesJSON)
                resolve(gamesJSONstr)
            } else {
            reject("You must be a registered member first")
            }
        }, 2000)
    })
    let result_from_promise = await promise_games
    console.log(result_from_promise)
    const gamesJSONparsed = JSON.parse(result_from_promise)
    console.log(gamesJSONparsed)
}

fetch_games()
let someStrToPrint = "bob"
console.log(someStrToPrint)