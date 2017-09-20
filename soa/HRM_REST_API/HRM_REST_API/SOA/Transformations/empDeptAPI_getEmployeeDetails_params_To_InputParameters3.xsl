<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet version="1.0" xmlns:oraxsl="http://www.oracle.com/XSL/Transform/java"
                xmlns:xp20="http://www.oracle.com/XSL/Transform/java/oracle.tip.pc.services.functions.Xpath20"
                xmlns:xref="http://www.oracle.com/XSL/Transform/java/oracle.tip.xref.xpath.XRefXPathFunctions"
                xmlns:mhdr="http://www.oracle.com/XSL/Transform/java/oracle.tip.mediator.service.common.functions.MediatorExtnFunction"
                xmlns:oraext="http://www.oracle.com/XSL/Transform/java/oracle.tip.pc.services.functions.ExtFunc"
                xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xmlns:dvm="http://www.oracle.com/XSL/Transform/java/oracle.tip.dvm.LookupValue"
                xmlns:oracle-xsl-mapper="http://www.oracle.com/xsl/mapper/schemas"
                xmlns:socket="http://www.oracle.com/XSL/Transform/java/oracle.tip.adapter.socket.ProtocolTranslator"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:ns0="http://xmlns.oracle.com/HRM_REST_API/HRM_REST_API/DeptEmpAPI"
                xmlns:tns="http://xmlns.oracle.com/pcbpel/adapter/db/sp/getEmployeeDetails"
                exclude-result-prefixes="xsd xsi oracle-xsl-mapper xsl ns0 tns oraxsl xp20 xref mhdr oraext dvm socket"
                xmlns:plnk="http://docs.oasis-open.org/wsbpel/2.0/plnktype"
                xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/" xmlns:inp3="DeptEmpAPI_getEmployeeDetails_response"
                xmlns:inp2="DeptEmpAPI_getAllEmployees_response" xmlns:jca="http://xmlns.oracle.com/pcbpel/wsdl/jca/"
                xmlns:ns1="http://xmlns.oracle.com/pcbpel/adapter/db/HRM_REST_API/HRM_REST_API/getEmployeeDetails"
                xmlns:plt="http://schemas.xmlsoap.org/ws/2003/05/partner-link/">
    <oracle-xsl-mapper:schema>
        <!--SPECIFICATION OF MAP SOURCES AND TARGETS, DO NOT MODIFY.-->
        <oracle-xsl-mapper:mapSources>
            <oracle-xsl-mapper:source type="WSDL">
                <oracle-xsl-mapper:schema location="../WSDLs/DeptEmpAPI.wsdl"/>
                <oracle-xsl-mapper:rootElement name="getEmployeeDetails_params"
                                               namespace="http://xmlns.oracle.com/HRM_REST_API/HRM_REST_API/DeptEmpAPI"/>
            </oracle-xsl-mapper:source>
        </oracle-xsl-mapper:mapSources>
        <oracle-xsl-mapper:mapTargets>
            <oracle-xsl-mapper:target type="WSDL">
                <oracle-xsl-mapper:schema location="../WSDLs/getEmployeeDetails.wsdl"/>
                <oracle-xsl-mapper:rootElement name="InputParameters"
                                               namespace="http://xmlns.oracle.com/pcbpel/adapter/db/sp/getEmployeeDetails"/>
            </oracle-xsl-mapper:target>
        </oracle-xsl-mapper:mapTargets>
        <!--GENERATED BY ORACLE XSL MAPPER 12.1.3.0.0(XSLT Build 140529.0700.0211) AT [MON SEP 18 06:46:56 CEST 2017].-->
    </oracle-xsl-mapper:schema>
    <!--User Editing allowed BELOW this line - DO NOT DELETE THIS LINE-->
    <xsl:template match="/">
        <tns:InputParameters>
            <tns:P_ID>
                <xsl:value-of select="/ns0:getEmployeeDetails_params/ns0:employeeId"/>
            </tns:P_ID>
        </tns:InputParameters>
    </xsl:template>
</xsl:stylesheet>
