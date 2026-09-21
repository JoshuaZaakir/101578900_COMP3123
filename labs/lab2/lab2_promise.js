/**
 * Purpose: Act as an API developer and create a promise that either resolves or rejects.
 */

async function fetch_games() {
  let promise_games = new Promise((resolve, reject) => {
    let isRegistered = true;
    setTimeout(() => {
      if (isRegistered) {
        const gamesJSON = {
          monday: "leafs",
          tuesday: "raptors",
        };

        // Use JSON.stringify() to convert the games object to a JSON string.
        let gamesJSONstr = JSON.stringify(gamesJSON);
        resolve(gamesJSONstr);
      } else {
        reject("You must be a registered member first!");
      }
    }, 2000);
  });

  let result_from_promise = await promise_games;
  console.log(result_from_promise);
  const gamesJSONparsed = JSON.parse(result_from_promise);
  console.log(gamesJSONparsed);
  console.log(gamesJSONparsed.monday);
}

fetch_games();
let someStrToPrint = "bob";
console.log(someStrToPrint);