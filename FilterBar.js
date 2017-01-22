/**
 * Created by shaohuan on 1/17/17.
 */

import React from 'react';
import M from 'mtf.utils';
import {findDOMNode} from 'react-dom';
import classnames from 'classnames';
import {Button as MtButton,Select as MultiSelect,Trigger}  from 'mtf.block';
import ButtonWrapper from './ButtonWrapper';
import NumberRange from './numberRange'

export default  class FilterBar extends M.BaseComponent {
    constructor(props){
        super(props);
        this.state = {
                "buttons": [{
                    "code":"city",
                    "label":"城市"
                },
                {
                    "code":"salary",
                    "label":"工资"
                },
                {
                    "code":"diploma",
                    "label":"学历"
                },
                {
                    "code":"gender",
                    "label":"性别"
                },
                {
                    "code":"age",
                    "label":"年龄"
                },
                {
                    "code":"updatedDays",
                    "label":"更新"
                }
            ],
            activeWndId:null,
            filterWndVisible:false,
            queryData:{}
        }

    }

    _fetchData = async(filter, callback,type) => {
        let res = await M.regularApi('/api/enums/'+type,{
            "keyword":""
        });

        let data = res.pageList;

        var result = filter ? data.filter(v => v.name.indexOf(filter) !== -1) : data;
        callback && callback(result);

    }

    componentDidMount(){
        //将这些数据设置进筛选组件中去
        this.mapUrlParamsToData();

    }



    /**
     * 点击页面区域的时候
     * @param e
     */
    handleClick (e) {

        e.stopPropagation();
        let activeWndId = this.getActiveWndId();

        if (!activeWndId) return;

        let activeTriggerId = activeWndId.replace('_target','_trigger');
        if (findDOMNode(this.refs[activeWndId]).contains(e.target)) {
            return;
        };

        //点击小窗口中的清楚小叉号按钮时，由于findDOM判断是不包含在其中的，故
        if (-1 !== e.target.className.indexOf('mt-input-clearIcon')) return;


        this.hideAllFilterWnds();
    }

    componentWillMount () {
        document.addEventListener('click', this.handleClick, false);
    }

    componentWillUnmount () {
        document.removeEventListener('click', this.handleClick, false);
    }

    /**
     * 隐藏筛选条件窗口
     * activeWndId 活动窗口ID
     */
    hideAllFilterWnds(activeWndId){
        this.setState({
            filterWndVisible:false,
            activeWndId:activeWndId
        });
    }


    /**
     * 每个过滤搜索条件的弹出框
     * @param targetId 筛选条件按钮的ID
     * @return {*}
     * @private
     */
    _getTarget = (targetId) => {
        return findDOMNode(this.refs[targetId]);
    };


    /**
     * 获取活动triggerid
     * @return {null}
     */
    getActiveWndId(){
        let activeWndId =  this.state.activeWndId;
        return activeWndId;
    }

    /**
     * 点击过滤条件按钮时是否显示弹出框
     * @param evt 事件
     * @param triggerId 弹出框的id
     */
    toggleFilterWnd(params = {triggerId:'',multiSelectId:null,targetId:null}){
        //console.log('togggle');
        let {triggerId,multiSelectId,targetId} = params;

        let trigger = this.refs[triggerId],
            visible = trigger.state.visible,
            activeWndId = true===!!targetId?targetId:null;

        //先要隐藏其他的窗口，或者县隐藏所有的窗口，然后再将这个窗口给呈现出来。
        this.hideAllFilterWnds(activeWndId);

        trigger.setState({
            visible:true
        },()=>{
            if (!!multiSelectId && !!this.refs[multiSelectId] ){
                this.refs[multiSelectId]._focusHandle();
            }
        });

    }

    /**
     * 将url的参数提取为JSON
     * @param hashBased
     * @return {*}
     */
    getJsonFromUrl(hashBased=false) {
        var query;
        if(hashBased) {
            var pos = location.href.indexOf("?");
            if(pos==-1) return [];
            query = location.href.substr(pos+1);
        } else {
            query = location.search.substr(1);
        }
        var result = {};
        query.split("&").forEach(function(part) {
            if(!part) return;
            part = part.split("+").join(" "); 
            var eq = part.indexOf("=");
            var key = eq>-1 ? part.substr(0,eq) : part;
            var val = eq>-1 ? decodeURIComponent(part.substr(eq+1)) : "";
            var from = key.indexOf("[");
            if(from==-1) result[decodeURIComponent(key)] = val;
            else {
                var to = key.indexOf("]");
                var index = decodeURIComponent(key.substring(from+1,to));
                key = decodeURIComponent(key.substring(0,from));
                if(!result[key]) result[key] = [];
                if(!index) result[key].push(val);
                else result[key][index] = val;
            }
        });
        return result;
    }

    /**
     * 提交数据
     * @param 组件的类型，数字组件或是下拉框组件
     */
    composeQueryData(category,triggerId){
        let boss = this,
            widget = this.whichWidget(category),
            queryData = {},
            code = "";

        //校验当前的输入框的合法性
        let numberWidgetArr = ["age","salary","updatedDays"];
        if( -1 !== numberWidgetArr.indexOf(category)){
            let handler = boss.refs[`_numberWidget_${category}`];
            if (true !== handler.doValidate()) return;
        }


        //遍历所有的筛选框，主要是下拉框和数字框两大类型
        let refs = boss.refs;
        for (let ref in refs){
            if (-1 !== ref.indexOf('_multiSelect_')){
                let code = ref.slice(ref.lastIndexOf('_')+1),
                    codeName = code+'Name',
                    control = boss.refs[ref],
                    valArr = control.state.value;

                if (valArr.length > 0){
                    queryData[code] = [];
                    queryData[codeName] = [];

                    if (Array.isArray(valArr)){
                        for (let item of valArr){
                            queryData[code].push(item.value);
                            queryData[codeName].push(item.label);

                        }
                    }
                }
            }else if (-1 !== ref.indexOf('_numberWidget_')){
                let code = ref.slice(ref.lastIndexOf('_')+1),
                    control = boss.refs[ref];

                let minValue = control.refs['minValue'].state.value,
                    maxValue = control.refs['maxValue'].state.value;
                switch (code){
                    case 'salary':
                        queryData['expectedSalaryLow']  = minValue;
                        queryData['expectedSalaryHigh'] = maxValue;
                        break;
                    case 'age':
                        queryData['minAge']  = minValue;
                        queryData['maxAge'] = maxValue;
                        break;
                    case 'updatedDays':
                        queryData['minUpdatedDays']  = minValue;
                        queryData['maxUpdatedDays'] = maxValue;
                        break;
                }

            }
        }

        boss.toggleFilterWnd({'triggerId':triggerId});


        if ('function' === typeof this.props.searchParameter){
            let dataFromUrl = boss.getJsonFromUrl();
            let finalData = Object.assign({},dataFromUrl,queryData);
            this.props.searchParameter(finalData);
            //console.log('出口' + JSON.stringify(queryData));

        }

        //console.log(JSON.stringify(queryData));

    }


    /**
     * 判断应该渲染下拉组件还是数字组件
     * @param code
     */
    whichWidget(code){
        let multiSelectArr = ['city','diploma','gender',"cityName","diplomaName","genderName"],
            numberArr = ["age","salary","updatedDays"];
        if (-1 !== multiSelectArr.indexOf(code)){
            return 'multiSelect';
        };

        if (-1 !== numberArr.indexOf(code)){
            return 'number';
        };

        return 'non-widget';
    }



    componentWillReceiveProps(newProps){
        this.mapUrlParamsToData(newProps.parameter);
    }

    /**
     * 将URL参数映射为筛选组件中的数据
     * @param params
     */
    mapUrlParamsToData(parameter) {
        //console.log('入口' + JSON.stringify(parameter));
        let params = parameter,
            queryData = {};


        //主要更新queryData
        for (let key in params){
            let _paramVal = params[key],
                widget = this.whichWidget(key);
            if ('multiSelect' == widget){
                if (Array.isArray(params[key])){
                    queryData[key] = params[key];
                }else{
                    queryData[key] = params[key].split(',');
                }
            }else if('number' == widget){
                queryData[key] = params[key];
            }else{
                queryData[key] = params[key];
            }
        }

        this.setState({
            queryData:queryData
        });

    }

    /**
     * 检查数字组件是否设置了值
     * @param queryData
     * @param category
     */
    numberWidgetHasValue(queryData,category){
        switch (category){
            case 'age':
                if (!!queryData['minAge'] || !!queryData['maxAge']) {
                    return true;
                }
                break;
            case 'salary':
                if (!!queryData['expectedSalaryLow'] || !!queryData['expectedSalaryHigh']) {
                    return true;
                }
                break;
            case 'updatedDays':
                if (!!queryData['minUpdatedDays'] || !!queryData['maxUpdatedDays']) {
                    return true;
                }
                break;
            default :
                return false
        }
        return false;

    }

    generateNumberWidget(props={ref:"",category:""}){
        let {ref,category}  = props,
            minValue = "",
            maxValue = "",
            queryData = this.state.queryData;

        switch (category){
            case 'updatedDays':
                minValue = queryData['minUpdatedDays'];
                maxValue = queryData['maxUpdatedDays'];
                break;
            case 'salary':
                minValue = queryData['expectedSalaryLow'];
                maxValue = queryData['expectedSalaryHigh'];
                break;
            case 'age':
                minValue = queryData['minAge'];
                maxValue = queryData['maxAge'];
                break;
        }


        return (<NumberRange ref={ref}
                             category={category}
                             minValue={minValue}
                             maxValue={maxValue}

            />);
    }



    /**
     * 点击多选下拉框时的事件
     * @param option
     * @param category
     */
    onMultiSelectCheck(option,category){
        let queryData = this.state.queryData,
            categoryName = category+'Name';

        if (!Array.isArray(queryData[category])){
            queryData[category] = [];
            queryData[categoryName] = [];
        }

        queryData[category].push(option.id);
        queryData[categoryName].push(option.name);
    }

    render(){
        let {buttons,queryData,filterWndVisible,activeWndId,parameter} = this.state,
            boss = this;

        const model = {
            idField: 'id',
            showField: 'name'
        };

        return (<div className="filter-menu-wrapper">

            {
                buttons.map(function(filterBtn,index){
                    let triggerId = `_trigger_${filterBtn.code}`,
                        targetId = `_target_${filterBtn.code}`,
                        multiSelectId = `_multiSelect_${filterBtn.code}`,
                        category = filterBtn.code,
                        widget =  boss.whichWidget(filterBtn.code),
                        numberWidgetId = `_numberWidget_${filterBtn.code}`,
                        wndClass = 'number'===widget?"filter-wnd number-widget":"filter-wnd multi-select-widget";




                    let dropDownValue = [];
                    if (Array.isArray(queryData[category])){
                        for (let i=0; i<queryData[category].length; i++){
                            dropDownValue.push({
                                label:queryData[`${category}Name`][i],
                                value:queryData[category][i]
                            });
                        }
                    }

                    let numberWidgetHasValue = boss.numberWidgetHasValue(queryData,category)
                    return(
                        <div key={index} className="menu-item">

                            <ButtonWrapper
                                ref={targetId}>
                                <MtButton
                                    label={filterBtn.label}
                                    className={classnames({btnAction: (dropDownValue.length>0 || numberWidgetHasValue)?true:false })}
                                    icon={(dropDownValue.length>0 ||numberWidgetHasValue)? "filter":"caret-down" }
                                    iconRight={true}
                                    onClick={(btn,evt)=>{
                                               evt.stopPropagation();
                                               if ('multiSelect' === boss.whichWidget(category)){
                                                   boss.toggleFilterWnd({'targetId':targetId,'triggerId':triggerId,'multiSelectId':multiSelectId});
                                               }else{
                                                   boss.toggleFilterWnd({'targetId':targetId,'triggerId':triggerId});
                                               }


                                      }}
                                    />
                            </ButtonWrapper>
                                <Trigger
                                         visible ={filterWndVisible}
                                         ref={triggerId}
                                         target={boss._getTarget.bind(boss, targetId)}
                                         equalTargetWidth={false}>
                                    <div className={wndClass}>
                                        <div className="clear-select"
                                             onClick={(evt)=>{
                                                 evt.stopPropagation();

                                                 if ('multiSelect' === boss.whichWidget(category)){
                                                       boss.refs[multiSelectId].reset();
                                                       boss.refs[multiSelectId]._focusHandle();
                                                 }else if('number' === boss.whichWidget(category)){
                                                       boss.refs[numberWidgetId].reset();
                                                  }
                                             }}>
                                            清空条件
                                        </div>

                                        {
                                            'multiSelect' === widget?
                                                <MultiSelect
                                                    ref={multiSelectId}
                                                    model={model}
                                                    required={false}
                                                    multiple={true}
                                                    placeholder=""
                                                    value={dropDownValue}
                                                    onSelect={(option,evt)=>{
                                                        evt.stopPropagation();
                                                        boss.onMultiSelectCheck(option,category);
                                                    }}
                                                    onFetchData={(filter,callback)=>{
                                                        boss._fetchData(filter,callback,category);
                                                    }
                                                    }/>
                                                :boss.generateNumberWidget({ref:numberWidgetId,'category':category})

                                        }


                                        <div className="bottom-button-panel">
                                            <MtButton label="确定" type="primary" size="small" onClick={(btn,evt)=>{
                                                evt.stopPropagation();
                                                boss.composeQueryData(category,triggerId);

                                            }
                                            }/>
                                            <MtButton label="取消" type="default" size="small" onClick={(btn,evt)=>{boss.toggleFilterWnd({'triggerId':triggerId})}}/>
                                        </div>
                                    </div>
                                </Trigger>
                            </div>


                    )
                })
            }
            <div style={{"clear":"both"}} ></div>

        </div>);
    }
}