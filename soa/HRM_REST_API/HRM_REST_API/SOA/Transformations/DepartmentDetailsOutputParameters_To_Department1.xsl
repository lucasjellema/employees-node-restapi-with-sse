<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet version="1.0"
                xmlns:xp20="http://www.oracle.com/XSL/Transform/java/oracle.tip.pc.services.functions.Xpath20"
                xmlns:oraxsl="http://www.oracle.com/XSL/Transform/java"
                xmlns:mhdr="http://www.oracle.com/XSL/Transform/java/oracle.tip.mediator.service.common.functions.MediatorExtnFunction"
                xmlns:oraext="http://www.oracle.com/XSL/Transform/java/oracle.tip.pc.services.functions.ExtFunc"
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xmlns:oracle-xsl-mapper="http://www.oracle.com/xsl/mapper/schemas"
                xmlns:dvm="http://www.oracle.com/XSL/Transform/java/oracle.tip.dvm.LookupValue"
                xmlns:ns0="http://xmlns.oracle.com/pcbpel/adapter/db/sp/getDepartmentDetails"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:tns="HrmRestAPI_GetDepartmentDetails_response"
                xmlns:xref="http://www.oracle.com/XSL/Transform/java/oracle.tip.xref.xpath.XRefXPathFunctions"
                xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                xmlns:socket="http://www.oracle.com/XSL/Transform/java/oracle.tip.adapter.socket.ProtocolTranslator"
                exclude-result-prefixes="xsi oracle-xsl-mapper xsl xsd ns0 tns xp20 oraxsl mhdr oraext dvm xref socket"
                xmlns:jca="http://xmlns.oracle.com/pcbpel/wsdl/jca/"
                xmlns:ns1="http://xmlns.oracle.com/pcbpel/adapter/db/HRM_REST_API/HRM_REST_API/getDepartmentDetails"
                xmlns:plt="http://schemas.xmlsoap.org/ws/2003/05/partner-link/"
                xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/"
                xmlns:ns2="http://xmlns.oracle.com/HRM_REST_API/HRM_REST_API/HRMRestAPI"
                xmlns:inp2="HrmRestAPI_getAllDepartments_response" xmlns:inp3="HrmRestAPI_CreateDepartments_request"
                xmlns:plnk="http://docs.oasis-open.org/wsbpel/2.0/plnktype" xmlns:inp4="HrmRestAPI_Result_response">
  <oracle-xsl-mapper:schema>
    <!--SPECIFICATION OF MAP SOURCES AND TARGETS, DO NOT MODIFY.-->
    <oracle-xsl-mapper:mapSources>
      <oracle-xsl-mapper:source type="WSDL">
        <oracle-xsl-mapper:schema location="../WSDLs/getDepartmentDetails.wsdl"/>
        <oracle-xsl-mapper:rootElement name="OutputParameters"
                                       namespace="http://xmlns.oracle.com/pcbpel/adapter/db/sp/getDepartmentDetails"/>
      </oracle-xsl-mapper:source>
    </oracle-xsl-mapper:mapSources>
    <oracle-xsl-mapper:mapTargets>
      <oracle-xsl-mapper:target type="WSDL">
        <oracle-xsl-mapper:schema location="../WSDLs/HRMRestAPI.wsdl"/>
        <oracle-xsl-mapper:rootElement name="Department" namespace="HrmRestAPI_GetDepartmentDetails_response"/>
      </oracle-xsl-mapper:target>
    </oracle-xsl-mapper:mapTargets>
    <!--GENERATED BY ORACLE XSL MAPPER 12.1.3.0.0(XSLT Build 140529.0700.0211) AT [SAT SEP 16 13:05:10 CEST 2017].-->
  </oracle-xsl-mapper:schema>
  <!--User Editing allowed BELOW this line - DO NOT DELETE THIS LINE-->
  <xsl:template match="/">
    <tns:Department>
      <tns:name>
        <xsl:value-of select="/ns0:OutputParameters/ns0:GET_DEPARTMENT/ns0:NAME"/>
      </tns:name>
      <tns:id>
        <xsl:value-of select="/ns0:OutputParameters/ns0:GET_DEPARTMENT/ns0:ID"/>
      </tns:id>
      <tns:location>
        <xsl:value-of select="/ns0:OutputParameters/ns0:GET_DEPARTMENT/ns0:LOCATION"/>
      </tns:location>
      <tns:salarySum>
        <xsl:value-of select="/ns0:OutputParameters/ns0:GET_DEPARTMENT/ns0:SALARY_SUM"/>
      </tns:salarySum>
      <tns:employeeCount>
        <xsl:value-of select="/ns0:OutputParameters/ns0:GET_DEPARTMENT/ns0:EMPLOYEES_COUNT"/>
      </tns:employeeCount>
    </tns:Department>
  </xsl:template>
</xsl:stylesheet>