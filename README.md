#条件筛选组件#
##示意图##
![MacDown FilterBar](filterBar.png)


##说明##
- 城市、学历、性别是枚举类型，点击时弹窗下拉复选框
- 工资、性别、年限、更新天数是数字类型，点击时弹出如图示意框
- 数字组件后端数据字段如下 <br/>
   1.工资：expectedSalaryLow,&emsp;expectedSalaryLow<br/>
   2.年限：minWorkYear,&emsp;maxWorkYear<br/>
   3.年龄： minAge,&emsp;maxAge<br/>
   4.更新天数：minUpdatedDays, &emsp;maxUpdatedDays<br/>
   
   

##要求##
- 点击按钮时，根据类型的不同弹出不同的框 <br/>
- 页面上最多允许弹出一个筛选窗口 </br>
- 下拉多选组件在初始打开时要将列表完整呈现出来
- 点击页面按钮和弹框之外的区域，窗口要关闭
- get请求
- 页面刷新后，需要将url中的参数数据同步到各组件中去
- 已经勾选了筛选条件的按钮要有漏斗样式，并且背景需如图所示
