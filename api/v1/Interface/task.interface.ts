export interface Find{
    _id? : string,
    title? : RegExp,
    status? : string,
    content? : string,
    deleted? : boolean,
    $or? : any
}