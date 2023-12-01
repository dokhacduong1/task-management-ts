export const filterQueryStatus = (query : string) : boolean => {
    //Tạo một mảng để ghi vào các giá trị mong muốn kiểm tra
    let filterQueryStatus : string[] = ["initial","doing","finish","pending","notFinish"];
  
     //Kiểm tra xem trong mảng đã cho có tồn tại query vừa truyền vào hay không
     const checkQuery : boolean = filterQueryStatus.includes(query);

     return checkQuery;
}
