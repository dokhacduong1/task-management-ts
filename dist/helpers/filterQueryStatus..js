"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterQueryStatus = void 0;
const filterQueryStatus = (query) => {
    let filterQueryStatus = ["initial", "doing", "finish", "pending", "notFinish"];
    const checkQuery = filterQueryStatus.includes(query);
    return checkQuery;
};
exports.filterQueryStatus = filterQueryStatus;
