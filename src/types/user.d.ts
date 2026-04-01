// declare type RoleI = "admin" | "client"

interface UserI{
    _id:string;
    firstName:string;
    lastName:string;
    // role: RoleI
    email:string;
    password:string;
    createdAt:string;
    enable:boolean;
    token?:string;
    encryptedRMK: string;
    salt: string;
    rmk_iv: string;
}