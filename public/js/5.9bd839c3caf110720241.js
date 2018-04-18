webpackJsonp([5],{"89KE":function(e,t){},pVB8:function(e,t){},peVM:function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=o("bOdI"),l=o.n(r),a=o("c2Ch"),n={data:function(){var e;return e={propertyWantsInfo:[],propertyWantsDialogVisible:!1,propertyWantsDialogTitle:"产权意向信息"},l()(e,"propertyWantsInfo",[]),l()(e,"propertysInfo",[]),l()(e,"propertyInfoForm",{}),l()(e,"propertyInfoDialogVisible",!1),l()(e,"propertyInfoDialogTitle","新建或修改产权信息"),l()(e,"propertyInfoFormRules",{propertyName:[{required:!0,message:"请填写产权名",trigger:"blur"}],summary:[{required:!0,message:"请填写摘要",trigger:"blur"}],detail:[{required:!0,message:"请填写详情",trigger:"blur"}]}),e},mounted:function(){},created:function(){this.getPropertysInfo2()},methods:{getPropertysInfo2:function(){var e=this;Object(a.k)().then(function(t){console.log(t,"请求成功"),e.propertysInfo=t.data.propertys}).catch(function(e){console.log(e,"请求错误")})},editPropertyInfo:function(e){var t=this;e?Object(a.j)({_id:e._id}).then(function(e){console.log(e,"请求成功"),t.propertyInfoForm=e.data.property,t.propertyInfoDialogTitle="编辑产权（ID："+e.data.property._id+"）",t.propertyInfoDialogVisible=!0}).catch(function(e){console.log(e,"请求错误")}):(this.propertyInfoForm={isPublish:!0,isSelt:!1},this.propertyInfoDialogTitle="新建产权信息",this.propertyInfoDialogVisible=!0)},postPropertyInfo2:function(){var e=this;this.$refs.propertyInfoForm.validate(function(t){t?Object(a.p)(e.propertyInfoForm).then(function(t){console.log(t,"请求成功"),e.propertyInfoDialogVisible=!1,e.propertyInfoForm={},e.getPropertysInfo2()}).catch(function(e){console.log(e,"请求错误")}):e.$message({message:"请完整填写产权信息",type:"error"})})},getWantsInfo2:function(e){var t=this;e&&Object(a.n)({_id:e._id}).then(function(o){console.log(o,"请求成功"),o.data.wants&&(t.propertyWantsInfo=o.data.wants,t.propertyWantsDialogTitle="产权意向信息（ID："+e._id+"）",t.propertyWantsDialogVisible=!0)}).catch(function(e){console.log(e,"请求错误")})}}},s={render:function(){var e=this,t=e.$createElement,o=e._self._c||t;return o("div",[o("el-button",{on:{click:function(t){e.editPropertyInfo()}}},[e._v("发布新产权")]),e._v(" "),o("el-table",{staticStyle:{width:"100%"},attrs:{data:e.propertysInfo,border:""}},[o("el-table-column",{attrs:{type:"expand"},scopedSlots:e._u([{key:"default",fn:function(t){return[o("el-form",{staticClass:"demo-table-expand",attrs:{"label-position":"left",inline:""}},[o("el-form-item",{attrs:{label:"产权ID"}},[o("span",[e._v(e._s(t.row._id||"null"))])]),e._v(" "),o("el-form-item",{attrs:{label:"产权名"}},[o("span",[e._v(e._s(t.row.propertyName||"null"))])]),e._v(" "),o("el-form-item",{attrs:{label:"是否发布"}},[o("span",[e._v(e._s(t.row.isPublish?"发布中":"未发布"))])]),e._v(" "),o("el-form-item",{attrs:{label:"是否售出"}},[o("span",[e._v(e._s(t.row.isSelt?"已售出":"出售中"))])]),e._v(" "),o("el-form-item",{attrs:{label:"状态"}},[o("span",[e._v(e._s(t.row.isDisabled?"被禁用":"正常"))])]),e._v(" "),o("el-form-item",{attrs:{label:"创建时间"}},[o("span",[e._v(e._s(new Date(t.row.createTime).toLocaleString("chinese",{hour12:!1})||"null"))])]),e._v(" "),o("el-form-item",{attrs:{label:"编辑时间"}},[o("span",[e._v(e._s(new Date(t.row.editTime).toLocaleString("chinese",{hour12:!1})||"null"))])]),e._v(" "),o("el-form-item",{attrs:{label:"摘要"}},[o("span",[e._v(e._s(t.row.summary||"null"))])])],1)]}}])}),e._v(" "),o("el-table-column",{attrs:{prop:"_id",label:"产权ID"}}),e._v(" "),o("el-table-column",{attrs:{prop:"propertyName",label:"产权名"}}),e._v(" "),o("el-table-column",{attrs:{fixed:"right",label:"操作",width:"90px"},scopedSlots:e._u([{key:"default",fn:function(t){return[o("el-button",{attrs:{type:"text",size:"small"},on:{click:function(o){e.getWantsInfo2(t.row)}}},[e._v("意向")]),e._v(" "),o("el-button",{attrs:{type:"text",size:"small"},on:{click:function(o){e.editPropertyInfo(t.row)}}},[e._v("编辑")])]}}])})],1),e._v(" "),o("el-dialog",{attrs:{title:e.propertyInfoDialogTitle,visible:e.propertyInfoDialogVisible,"append-to-body":!0,"custom-class":"property-info"},on:{"update:visible":function(t){e.propertyInfoDialogVisible=t}}},[o("el-form",{ref:"propertyInfoForm",attrs:{model:e.propertyInfoForm,"status-icon":"","label-width":"80px",rules:e.propertyInfoFormRules}},[o("el-form-item",{attrs:{label:"产权名",prop:"propertyName"}},[o("el-input",{model:{value:e.propertyInfoForm.propertyName,callback:function(t){e.$set(e.propertyInfoForm,"propertyName",t)},expression:"propertyInfoForm.propertyName"}})],1),e._v(" "),o("el-form-item",{attrs:{label:"摘要",prop:"summary"}},[o("el-input",{model:{value:e.propertyInfoForm.summary,callback:function(t){e.$set(e.propertyInfoForm,"summary",t)},expression:"propertyInfoForm.summary"}})],1),e._v(" "),o("el-form-item",{attrs:{label:"详情",prop:"detail"}},[o("el-input",{attrs:{type:"textarea",autosize:{minRows:2,maxRows:4}},model:{value:e.propertyInfoForm.detail,callback:function(t){e.$set(e.propertyInfoForm,"detail",t)},expression:"propertyInfoForm.detail"}})],1),e._v(" "),o("el-form-item",{attrs:{label:"是否发布"}},[o("el-switch",{model:{value:e.propertyInfoForm.isPublish,callback:function(t){e.$set(e.propertyInfoForm,"isPublish",t)},expression:"propertyInfoForm.isPublish"}})],1),e._v(" "),o("el-form-item",{attrs:{label:"是否售出"}},[o("el-switch",{model:{value:e.propertyInfoForm.isSelt,callback:function(t){e.$set(e.propertyInfoForm,"isSelt",t)},expression:"propertyInfoForm.isSelt"}})],1),e._v(" "),o("el-form-item",[o("el-button",{attrs:{type:"primary"},on:{click:function(t){e.postPropertyInfo2()}}},[e._v("确定")])],1)],1)],1),e._v(" "),o("el-dialog",{attrs:{title:e.propertyWantsDialogTitle,visible:e.propertyWantsDialogVisible,"append-to-body":!0,"custom-class":"property-wants"},on:{"update:visible":function(t){e.propertyWantsDialogVisible=t}}},[o("el-table",{staticStyle:{width:"100%"},attrs:{data:e.propertyWantsInfo,border:""}},[o("el-table-column",{attrs:{prop:"wanter._id",label:"意向者ID"}}),e._v(" "),o("el-table-column",{attrs:{prop:"wanter.username",label:"用户名"}}),e._v(" "),o("el-table-column",{attrs:{prop:"wanter.email",label:"邮箱"}}),e._v(" "),o("el-table-column",{attrs:{prop:"wanter.telephone",label:"电话"}}),e._v(" "),o("el-table-column",{attrs:{prop:"wanter.qqNumber",label:"QQ号码"}}),e._v(" "),o("el-table-column",{attrs:{prop:"wanter.wechat",label:"微信号"}}),e._v(" "),o("el-table-column",{attrs:{prop:"message",label:"留言"}}),e._v(" "),o("el-table-column",{attrs:{label:"时间"},scopedSlots:e._u([{key:"default",fn:function(t){return[o("div",{staticClass:"cell"},[e._v(e._s(new Date(t.row.createTime).toLocaleString("chinese",{hour12:!1})))])]}}])})],1)],1)],1)},staticRenderFns:[]};var i=o("VU/8")(n,s,!1,function(e){o("pVB8"),o("89KE")},"data-v-3e60d2b9",null);t.default=i.exports}});
//# sourceMappingURL=5.9bd839c3caf110720241.js.map