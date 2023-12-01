"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterQueryPagination = void 0;
const filterQueryPagination = (countRecord, checkPage, limitItem) => {
    let objectPagination = {
        currentPage: checkPage,
        limitItem: limitItem,
    };
    objectPagination.skip = (objectPagination.currentPage - 1) * objectPagination.limitItem;
    const totalPage = Math.ceil(countRecord / objectPagination.limitItem);
    objectPagination.totalPage = totalPage;
    return objectPagination;
};
exports.filterQueryPagination = filterQueryPagination;
