export function distinct<T>(arr:T[]):T[]{
    let distinct = [...new Set(arr)];
    return distinct;
}

//https://stackoverflow.com/a/51160727
//when a promise is ready check its result
//if the promise returns true, then we know that the item contains at least 1 file which matches the criteria
//if the primise returns false, it is ignored
//if all the promises return false, then the result is false
export function firstTrue(promises:Promise<boolean>[]) :Promise<boolean> {
    const newPromises:Promise<boolean>[] = promises.map(p => new Promise(
        //turn the promises from true/false to resolve/reject - the 1st promise to resolve is enough to mean that result is true
        (resolve, reject) => p.then(v => v && resolve(true), reject)
    ));
    //will finish after all the other promises
    newPromises.push(Promise.all(promises).then(() => false));
    return Promise.race(newPromises);
}