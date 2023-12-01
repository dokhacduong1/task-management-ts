
interface ObjectPagination{
    currentPage? : number,
    limitItem? : number
    skip? : number,
    totalPage? : number
}


//Chúng ta phải truyền 3 tham số
//countRecord: Số lượng sản phẩm của bảng
//checkPage: Page hiện tại của sản phẩm
//limitPage: Số lượng sản phẩm cần hiển thị
export const filterQueryPagination = (countRecord : number, checkPage : number, limitItem :number) : ObjectPagination => {
    //Khai báo biến phân trang
    let objectPagination : ObjectPagination = {
        //Nếu checkPage không có nó sẽ là 1
        currentPage: checkPage,
        limitItem: limitItem,
    };
    //Thêm skip cho phân trang 
    objectPagination.skip = (objectPagination.currentPage - 1) * objectPagination.limitItem;
    //Tính số Page sản phẩm cho trang
    const totalPage : number = Math.ceil(countRecord / objectPagination.limitItem);
    objectPagination.totalPage = totalPage;
    return objectPagination;
}