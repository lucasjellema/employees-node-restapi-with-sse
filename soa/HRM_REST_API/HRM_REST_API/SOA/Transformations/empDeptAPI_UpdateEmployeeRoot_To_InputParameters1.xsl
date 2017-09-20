<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet version="1.0"
                xmlns:xp20="http://www.oracle.com/XSL/Transform/java/oracle.tip.pc.services.functions.Xpath20"
                xmlns:oraxsl="http://www.oracle.com/XSL/Transform/java"
                xmlns:mhdr="http://www.oracle.com/XSL/Transform/java/oracle.tip.mediator.service.common.functions.MediatorExtnFunction"
                xmlns:oraext="http://www.oracle.com/XSL/Transform/java/oracle.tip.pc.services.functions.ExtFunc"
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xmlns:oracle-xsl-mapper="http://www.oracle.com/xsl/mapper/schemas"
                xmlns:dvm="http://www.oracle.com/XSL/Transform/java/oracle.tip.dvm.LookupValue"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:xref="http://www.oracle.com/XSL/Transform/java/oracle.tip.xref.xpath.XRefXPathFunctions"
                xmlns:tns="http://xmlns.oracle.com/pcbpel/adapter/db/sp/updateEmployee"
                xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:ns0="DeptEmpAPI_getEmployeeDetails_response"
                xmlns:socket="http://www.oracle.com/XSL/Transform/java/oracle.tip.adapter.socket.ProtocolTranslator"
                exclude-result-prefixes="xsi oracle-xsl-mapper xsl xsd ns0 tns xp20 oraxsl mhdr oraext dvm xref socket"
                xmlns:plnk="http://docs.oasis-open.org/wsbpel/2.0/plnktype"
                xmlns:ns1="http://xmlns.oracle.com/HRM_REST_API/HRM_REST_API/DeptEmpAPI6"
                xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/"
                xmlns:ns2="http://xmlns.oracle.com/pcbpel/adapter/db/HRM_REST_API/HRM_REST_API/updateEmployee"
                xmlns:jca="http://xmlns.oracle.com/pcbpel/wsdl/jca/"
                xmlns:plt="http://schemas.xmlsoap.org/ws/2003/05/partner-link/">
    <oracle-xsl-mapper:schema>
        <!--SPECIFICATION OF MAP SOURCES AND TARGETS, DO NOT MODIFY.-->
        <oracle-xsl-mapper:mapSources>
            <oracle-xsl-mapper:source type="WSDL">
                <oracle-xsl-mapper:schema location="../WSDLs/DeptEmpAPI6.wsdl"/>
                <oracle-xsl-mapper:rootElement name="EmployeeRoot" namespace="DeptEmpAPI_getEmployeeDetails_response"/>
            </oracle-xsl-mapper:source>
        </oracle-xsl-mapper:mapSources>
        <oracle-xsl-mapper:mapTargets>
            <oracle-xsl-mapper:target type="WSDL">
                <oracle-xsl-mapper:schema location="../WSDLs/updateEmployee.wsdl"/>
                <oracle-xsl-mapper:rootElement name="InputParameters"
                                               namespace="http://xmlns.oracle.com/pcbpel/adapter/db/sp/updateEmployee"/>
            </oracle-xsl-mapper:target>
        </oracle-xsl-mapper:mapTargets>
        <!--GENERATED BY ORACLE XSL MAPPER 12.1.3.0.0(XSLT Build 140529.0700.0211) AT [MON SEP 18 14:19:32 CEST 2017].-->
    </oracle-xsl-mapper:schema>
    <!--User Editing allowed BELOW this line - DO NOT DELETE THIS LINE-->
    <xsl:template match="/">
        <tns:InputParameters>
            <tns:P_EMP>
                <tns:ID>
                    <xsl:value-of select="/ns0:EmployeeRoot/ns0:id"/>
                </tns:ID>
                <tns:NAME>
                    <xsl:value-of select="/ns0:EmployeeRoot/ns0:name"/>
                </tns:NAME>
                <tns:JOB>
                    <xsl:value-of select="/ns0:EmployeeRoot/ns0:job"/>
                </tns:JOB>
                <tns:DEPARTMENT_ID>
                    <xsl:value-of select="/ns0:EmployeeRoot/ns0:departmentId"/>
                </tns:DEPARTMENT_ID>
                <tns:SALARY>
                    <xsl:value-of select="/ns0:EmployeeRoot/ns0:salary"/>
                </tns:SALARY>
                <tns:HIREDATE>
                    <xsl:value-of select="/ns0:EmployeeRoot/ns0:hiredate"/>
                </tns:HIREDATE>
                <tns:MANAGER>
                    <tns:ID>
                        <xsl:value-of select="/ns0:EmployeeRoot/ns0:managerId"/>
                    </tns:ID>
                </tns:MANAGER>
                <tns:STAFF>
                    <xsl:for-each select="/ns0:EmployeeRoot/ns0:staff">
                        <tns:STAFF_ITEM>
                            <tns:ID>
                                <xsl:value-of select="ns0:id"/>
                            </tns:ID>
                            <tns:NAME>
                                <xsl:value-of select="ns0:name"/>
                            </tns:NAME>
                            <tns:JOB>
                                <xsl:value-of select="ns0:job"/>
                            </tns:JOB>
                        </tns:STAFF_ITEM>
                    </xsl:for-each>
                </tns:STAFF>
            </tns:P_EMP>
        </tns:InputParameters>
    </xsl:template>
</xsl:stylesheet>
