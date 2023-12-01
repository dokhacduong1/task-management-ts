import { Request, Response } from "express";
import Task from "../../../models/task.model";
import { Find } from "../Interface/task.interface";
import { filterQueryStatus } from "../../../helpers/filterQueryStatus.";
import { filterQuerySearch } from "../../../helpers/filterQuerySearch";
import { filterQueryPagination } from "../../../helpers/filterQueryPagination.";
// [GET] /api/v1/tasks
export const index = async function (req: Request, res: Response): Promise<void> {
    try {
        //Khai báo biến find.
        //Đoạn or là lấy ra các id có trong trường createdBy hoặc nếu không có trong trường createdBy thì lấy ra trong mảng listUsser nếu có
        //Nói chung có nghĩa là lấy các user có quyền tham gia được task này
        const find: Find = {
            deleted: false,
            $or:[
                {createdBy: req["user"].id},
                {listUsers: req["user"].id},
            ]
        }

        //Khai báo các biến query
        let queryStatus: string;
        let querySortKey: string;
        let querySortValue: string;
        let queryPage: number = 1;
        let queryLimit: number = 4;
        let queryKeyword: string;

        //Check xem nếu query có status thì gán vào biến checkQueryStatus không thì gán bằng rỗng. (Chức Năng Check Trạng Thái)
        if (req.query.status) {
            queryStatus = req.query.status.toString() || "";
        }

        //Check xem nếu query có sortKey  thì gán vào biến sortKey không thì gán bằng title. (Chức Năng Sắp Xếp)
        if (req.query.sortKey) {
            querySortKey = req.query.sortKey.toString() || "title";
        }

        //Check xem nếu query có sortValue  thì gán vào biến sortValue không thì gán bằng desc. (Chức Năng Sắp Xếp)
        if (req.query.sortValue) {
            querySortValue = req.query.sortValue.toString() || "asc";
        }

        //Check xem nếu query có queryPage thì gán vào biến queryPage không thì gán bằng rỗng. (Chức Năng Phân Trang)
        if (req.query.page) {
            queryPage = parseInt(req.query.page.toString());
        }

        //Check xem nếu query có queryLimit thì gán vào biến queryLimit không thì gán bằng 1. (Chức Năng Phân Trang)
        if (req.query.limit) {
            queryLimit = parseInt(req.query.limit.toString());
        }

        //Check xem nếu query có queryKeyword thì gán vào biến queryKeyword không thì gán bằng rỗng. (Chức Tìm Kiếm)
        if (req.query.keyword) {

            queryKeyword = req.query.keyword.toString() || "";
        }

        

        //Trước khi gán status vào find thì kiểm tra query có hợp lệ hoặc tồn tại hay không. (Chức Năng Check Trạng Thái)
        if (queryStatus && filterQueryStatus(queryStatus)) {
            find.status = queryStatus;
        }

        //Trước khi gán title vào find thì kiểm tra query có hợp lệ hoặc tồn tại hay không. (Chức Năng Tìm Kiếm)
        if (queryKeyword && filterQuerySearch(queryKeyword)) {
            find.title = filterQuerySearch(queryKeyword);
        }

        //Đếm xem bảng record có bao nhiêu sản phẩm và check phân trang (Chức Năng Phân Trang)
        const countRecord = await Task.countDocuments(find);
        const objectPagination = filterQueryPagination(countRecord, queryPage, queryLimit);

        //Tạo một object gán sortKey , sortValue tìm được vào  (Chức Năng Sắp Xếp)
        let sort = {}
        //Nếu tồn tại thì mới gán vào sort
        if(querySortKey && querySortValue){
            sort = {
                [querySortKey]: querySortValue
            };
        }
        
       //Tìm tất cả các công việc.
        const tasks = await Task.find(find)
            .sort(sort)
            .limit(objectPagination.limitItem)
            .skip(objectPagination.skip);

        //Trả về công việc đó.
        res.status(200).json(tasks);
    } catch (error) {
        //Thông báo lỗi 500 đến người dùng server lỗi.
        console.error("Error in API:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
// [GET] /api/v1/tasks/detail/:id
export const detail = async function (req: Request, res: Response): Promise<void> {
    try {
        //Lấy id của thông tin trên params
        const id: string = req.params.id
        //Khai báo biến find.
        const find: Find = {
            deleted: false,
            _id: id,
        };
        
        //Tìm tất cả các công việc có id như param đã truyền vào.
        const task = await Task.findOne(find);
        //Trả về công việc đó.
        res.status(200).json(task);
    } catch (error) {
        //Thông báo lỗi 500 đến người dùng server lỗi.
        console.error("Error in API:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}


// [PATCH] /api/v1/tasks/change-status/:id
export const changeStatus = async function (req: Request, res: Response): Promise<void> {
    try {
        //Lấy id của thông tin trên params
        const id : string = req.params.id.toString();
        const status : string = req.body.status.toString();


        //Nếu qua được validate sẽ vào đây rồi update dữ liệu
        await Task.updateOne({
            _id: id
        }, {
            status: status
        })

        //Trả về cập nhật trạng thánh thành công
        res.status(200).json({ success: "Cập Nhật Trạng Thái Thành Công!" });
    } catch (error) {
        //Thông báo lỗi 500 đến người dùng server lỗi.
        console.error("Error in API:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// [PATCH] /api/v1/tasks/change-multi
 export const changeMulti = async function (req: Request, res: Response): Promise<void> {
    try {
        enum KEY {
            STATUS = "status",
            DELETED = "deleted",
        }

        let ids  : string[];
        let key  : string;
        let value  : string;
        //Mình sẽ lấy các phần tử người dùng gửi lên
        if(!req.body.ids || !req.body.key){
            res.status(400).json({ error: "Dữ Liệu Không Hợp Lệ!" });
            return;
        }
        if(req.body.ids){
            ids  = req.body.ids;
        }
        if(req.body.key){
            key  = req.body.key.toString();
        }
        if(req.body.value){
            value  = req.body.value.toString();
        }
       
        switch (key) {
            //Trường hợp này key bằng status
            case KEY.STATUS:
                //Nếu dữ liệu người dùng gửi lên không giống các trạng thái thì báo lỗi dữ liệu không hợp lệ
                if (!filterQueryStatus(value)) {
                    res.status(400).json({ error: "Dữ Liệu Không Hợp Lệ!" });
                    return;
                }
                //Update dữ liệu người dùng
                await Task.updateMany({ _id: { $in: ids } }, {
                    status: value
                });
                //Trả về cập nhật trạng thánh thành công
                res.status(200).json({ success: "Cập Nhật Trạng Thái Thành Công!" });
                break;
            case KEY.DELETED:
                //Xóa mềm dữ liệu của cảng mảng ids người dùng gửi lên,ghĩa là không xóa hẳn dữ liệu ra khỏi database mà chỉ chỉnh trường deteled thành true thôi
                await Task.updateMany({_id:ids},{
                    deleted:true,
                    deletedAt:new Date()
                })
                res.status(200).json({ success: "Xóa Dữ Liệu Thành Công!" });
                break;
            default:
                //Trả về lỗi nếu không tồn tại key hợp lệ nào
                res.status(400).json({ error: "Yêu Cầu Không Hợp Lệ Hoặc Không Được Hỗ Trợ Vui Lòng Thử Lại!" });
                break;
        }

    } catch (error) {
        //Thông báo lỗi 500 đến người dùng server lỗi.
        console.error("Error in API:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// [POST] /api/v1/tasks/create
export const create = async function(req: Request, res: Response): Promise<void> {
    try {
        
        //Bắt đầu lưu dữ liệu vào data base
        const task = new Task(req.body);
        await task.save();
        res.status(201).json({ success: "Tạo Công Việc Mới Thành Công!" });
    } catch (error) {
        //Thông báo lỗi 500 đến người dùng server lỗi.
        console.error("Error in API:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }

}

// [PATCH] /api/v1/tasks/edit/:id
export const edit = async function(req: Request, res: Response): Promise<void> {
    try {
        //Lấy ra id công việc muốn chỉnh sửa
        const id : string = req.params.id.toString();
        //Update công việc đó!
        await Task.updateOne({_id:id},req.body)
        res.status(200).json({ success: "Cập Nhật Công Việc Thành Công!" });
    } catch (error) {
        //Thông báo lỗi 500 đến người dùng server lỗi.
        console.error("Error in API:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// [delete] /api/v1/tasks/delete/:id
export const deleteTask = async function(req: Request, res: Response): Promise<void> {
    try {
        //Lấy ra id công việc muốn chỉnh sửa
        const id : string = req.params.id.toString();
        //Bắt đầu xóa mềm dữ liệu,nghĩa là không xóa hẳn dữ liệu ra khỏi database mà chỉ chỉnh trường deteled thành true thôi
        await Task.updateOne({_id:id},{
            deleted:true,
            deletedAt:new Date()
        })
        res.status(200).json({ success: "Xóa Dữ Liệu Thành Công!" });
    } catch (error) {
         //Thông báo lỗi 500 đến người dùng server lỗi.
         console.error("Error in API:", error);
         res.status(500).json({ error: "Internal Server Error" });
    } 
}
