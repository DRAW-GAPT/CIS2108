export function distinct<T>(arr:T[]):T[]{
    let distinct = [...new Set(arr)];
    return distinct;
}