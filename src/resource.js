
  var res = {
    world_png : "res/world-stereographic-perspective.png",
    dot_png : "res/Images/dot.png",
    grat_png : "res/graticule-stereographic-perspective.png",
    world_tilemap_tmx : "res/tmx-stereographic.tmx",
    world_tilemap_background : "res/background-stereographic.png",
    world_tilemap_foreground : "res/foreground-stereographic.png",

};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}
/*

  ZWE_png:"res/countries/ZWE_stereographic.png",
ZMB_png:"res/countries/ZMB_stereographic.png",
YEM_png:"res/countries/YEM_stereographic.png",
VNM_png:"res/countries/VNM_stereographic.png",
VEN_png:"res/countries/VEN_stereographic.png",
VAT_png:"res/countries/VAT_stereographic.png",
VUT_png:"res/countries/VUT_stereographic.png",
UZB_png:"res/countries/UZB_stereographic.png",
URY_png:"res/countries/URY_stereographic.png",
FSM_png:"res/countries/FSM_stereographic.png",
MHL_png:"res/countries/MHL_stereographic.png",
MNP_png:"res/countries/MNP_stereographic.png",
VIR_png:"res/countries/VIR_stereographic.png",
GUM_png:"res/countries/GUM_stereographic.png",
ASM_png:"res/countries/ASM_stereographic.png",
PRI_png:"res/countries/PRI_stereographic.png",
USA_png:"res/countries/USA_stereographic.png",
SGS_png:"res/countries/SGS_stereographic.png",
IOT_png:"res/countries/IOT_stereographic.png",
SHN_png:"res/countries/SHN_stereographic.png",
PCN_png:"res/countries/PCN_stereographic.png",
AIA_png:"res/countries/AIA_stereographic.png",
FLK_png:"res/countries/FLK_stereographic.png",
CYM_png:"res/countries/CYM_stereographic.png",
BMU_png:"res/countries/BMU_stereographic.png",
VGB_png:"res/countries/VGB_stereographic.png",
TCA_png:"res/countries/TCA_stereographic.png",
MSR_png:"res/countries/MSR_stereographic.png",
JEY_png:"res/countries/JEY_stereographic.png",
GGY_png:"res/countries/GGY_stereographic.png",
GBR_png:"res/countries/GBR_stereographic.png",
ARE_png:"res/countries/ARE_stereographic.png",
UKR_png:"res/countries/UKR_stereographic.png",
UGA_png:"res/countries/UGA_stereographic.png",
TKM_png:"res/countries/TKM_stereographic.png",
TUR_png:"res/countries/TUR_stereographic.png",
TUN_png:"res/countries/TUN_stereographic.png",
TTO_png:"res/countries/TTO_stereographic.png",
TON_png:"res/countries/TON_stereographic.png",
TGO_png:"res/countries/TGO_stereographic.png",
TLS_png:"res/countries/TLS_stereographic.png",
THA_png:"res/countries/THA_stereographic.png",
TZA_png:"res/countries/TZA_stereographic.png",
TJK_png:"res/countries/TJK_stereographic.png",
TWN_png:"res/countries/TWN_stereographic.png",
SYR_png:"res/countries/SYR_stereographic.png",
CHE_png:"res/countries/CHE_stereographic.png",
SWZ_png:"res/countries/SWZ_stereographic.png",
SUR_png:"res/countries/SUR_stereographic.png",
SSD_png:"res/countries/SSD_stereographic.png",
SDN_png:"res/countries/SDN_stereographic.png",
LKA_png:"res/countries/LKA_stereographic.png",
ESP_png:"res/countries/ESP_stereographic.png",
KOR_png:"res/countries/KOR_stereographic.png",
ZAF_png:"res/countries/ZAF_stereographic.png",
SOM_png:"res/countries/SOM_stereographic.png",
SLB_png:"res/countries/SLB_stereographic.png",
SVK_png:"res/countries/SVK_stereographic.png",
SVN_png:"res/countries/SVN_stereographic.png",
SGP_png:"res/countries/SGP_stereographic.png",
SLE_png:"res/countries/SLE_stereographic.png",
SYC_png:"res/countries/SYC_stereographic.png",
SRB_png:"res/countries/SRB_stereographic.png",
SEN_png:"res/countries/SEN_stereographic.png",
SAU_png:"res/countries/SAU_stereographic.png",
STP_png:"res/countries/STP_stereographic.png",
SMR_png:"res/countries/SMR_stereographic.png",
WSM_png:"res/countries/WSM_stereographic.png",
VCT_png:"res/countries/VCT_stereographic.png",
LCA_png:"res/countries/LCA_stereographic.png",
KNA_png:"res/countries/KNA_stereographic.png",
RWA_png:"res/countries/RWA_stereographic.png",
RUS_png:"res/countries/RUS_stereographic.png",
ROU_png:"res/countries/ROU_stereographic.png",
QAT_png:"res/countries/QAT_stereographic.png",
PRT_png:"res/countries/PRT_stereographic.png",
POL_png:"res/countries/POL_stereographic.png",
PHL_png:"res/countries/PHL_stereographic.png",
PER_png:"res/countries/PER_stereographic.png",
PRY_png:"res/countries/PRY_stereographic.png",
PNG_png:"res/countries/PNG_stereographic.png",
PAN_png:"res/countries/PAN_stereographic.png",
PLW_png:"res/countries/PLW_stereographic.png",
PAK_png:"res/countries/PAK_stereographic.png",
OMN_png:"res/countries/OMN_stereographic.png",
PRK_png:"res/countries/PRK_stereographic.png",
NGA_png:"res/countries/NGA_stereographic.png",
NER_png:"res/countries/NER_stereographic.png",
NIC_png:"res/countries/NIC_stereographic.png",
NZL_png:"res/countries/NZL_stereographic.png",
NIU_png:"res/countries/NIU_stereographic.png",
COK_png:"res/countries/COK_stereographic.png",
NLD_png:"res/countries/NLD_stereographic.png",
ABW_png:"res/countries/ABW_stereographic.png",
CUW_png:"res/countries/CUW_stereographic.png",
NPL_png:"res/countries/NPL_stereographic.png",
NRU_png:"res/countries/NRU_stereographic.png",
NAM_png:"res/countries/NAM_stereographic.png",
MOZ_png:"res/countries/MOZ_stereographic.png",
MAR_png:"res/countries/MAR_stereographic.png",
ESH_png:"res/countries/ESH_stereographic.png",
MNE_png:"res/countries/MNE_stereographic.png",
MNG_png:"res/countries/MNG_stereographic.png",
MDA_png:"res/countries/MDA_stereographic.png",
MCO_png:"res/countries/MCO_stereographic.png",
MEX_png:"res/countries/MEX_stereographic.png",
MUS_png:"res/countries/MUS_stereographic.png",
MRT_png:"res/countries/MRT_stereographic.png",
MLT_png:"res/countries/MLT_stereographic.png",
MLI_png:"res/countries/MLI_stereographic.png",
MDV_png:"res/countries/MDV_stereographic.png",
MYS_png:"res/countries/MYS_stereographic.png",
MWI_png:"res/countries/MWI_stereographic.png",
MDG_png:"res/countries/MDG_stereographic.png",
MKD_png:"res/countries/MKD_stereographic.png",
LUX_png:"res/countries/LUX_stereographic.png",
LIE_png:"res/countries/LIE_stereographic.png",
LBY_png:"res/countries/LBY_stereographic.png",
LBR_png:"res/countries/LBR_stereographic.png",
LSO_png:"res/countries/LSO_stereographic.png",
LBN_png:"res/countries/LBN_stereographic.png",
LAO_png:"res/countries/LAO_stereographic.png",
KGZ_png:"res/countries/KGZ_stereographic.png",
KWT_png:"res/countries/KWT_stereographic.png",
KOS_png:"res/countries/KOS_stereographic.png",
KIR_png:"res/countries/KIR_stereographic.png",
KEN_png:"res/countries/KEN_stereographic.png",
KAZ_png:"res/countries/KAZ_stereographic.png",
JOR_png:"res/countries/JOR_stereographic.png",
JPN_png:"res/countries/JPN_stereographic.png",
JAM_png:"res/countries/JAM_stereographic.png",
ITA_png:"res/countries/ITA_stereographic.png",
ISR_png:"res/countries/ISR_stereographic.png",
PSE_png:"res/countries/PSE_stereographic.png",
IRL_png:"res/countries/IRL_stereographic.png",
IRQ_png:"res/countries/IRQ_stereographic.png",
IRN_png:"res/countries/IRN_stereographic.png",
IDN_png:"res/countries/IDN_stereographic.png",
IND_png:"res/countries/IND_stereographic.png",
HUN_png:"res/countries/HUN_stereographic.png",
HND_png:"res/countries/HND_stereographic.png",
HTI_png:"res/countries/HTI_stereographic.png",
GUY_png:"res/countries/GUY_stereographic.png",
GNB_png:"res/countries/GNB_stereographic.png",
GIN_png:"res/countries/GIN_stereographic.png",
GTM_png:"res/countries/GTM_stereographic.png",
GRD_png:"res/countries/GRD_stereographic.png",
GRC_png:"res/countries/GRC_stereographic.png",
GHA_png:"res/countries/GHA_stereographic.png",
DEU_png:"res/countries/DEU_stereographic.png",
GEO_png:"res/countries/GEO_stereographic.png",
GMB_png:"res/countries/GMB_stereographic.png",
GAB_png:"res/countries/GAB_stereographic.png",
FRA_png:"res/countries/FRA_stereographic.png",
SPM_png:"res/countries/SPM_stereographic.png",
WLF_png:"res/countries/WLF_stereographic.png",
MAF_png:"res/countries/MAF_stereographic.png",
BLM_png:"res/countries/BLM_stereographic.png",
PYF_png:"res/countries/PYF_stereographic.png",
NCL_png:"res/countries/NCL_stereographic.png",
ATF_png:"res/countries/ATF_stereographic.png",
FJI_png:"res/countries/FJI_stereographic.png",
ETH_png:"res/countries/ETH_stereographic.png",
ERI_png:"res/countries/ERI_stereographic.png",
GNQ_png:"res/countries/GNQ_stereographic.png",
SLV_png:"res/countries/SLV_stereographic.png",
EGY_png:"res/countries/EGY_stereographic.png",
ECU_png:"res/countries/ECU_stereographic.png",
DOM_png:"res/countries/DOM_stereographic.png",
DMA_png:"res/countries/DMA_stereographic.png",
DJI_png:"res/countries/DJI_stereographic.png",
CZE_png:"res/countries/CZE_stereographic.png",
CYP_png:"res/countries/CYP_stereographic.png",
CUB_png:"res/countries/CUB_stereographic.png",
HRV_png:"res/countries/HRV_stereographic.png",
CIV_png:"res/countries/CIV_stereographic.png",
CRI_png:"res/countries/CRI_stereographic.png",
COD_png:"res/countries/COD_stereographic.png",
COG_png:"res/countries/COG_stereographic.png",
COM_png:"res/countries/COM_stereographic.png",
COL_png:"res/countries/COL_stereographic.png",
CHN_png:"res/countries/CHN_stereographic.png",
MAC_png:"res/countries/MAC_stereographic.png",
HKG_png:"res/countries/HKG_stereographic.png",
CHL_png:"res/countries/CHL_stereographic.png",
TCD_png:"res/countries/TCD_stereographic.png",
CAF_png:"res/countries/CAF_stereographic.png",
CPV_png:"res/countries/CPV_stereographic.png",
CAN_png:"res/countries/CAN_stereographic.png",
CMR_png:"res/countries/CMR_stereographic.png",
KHM_png:"res/countries/KHM_stereographic.png",
MMR_png:"res/countries/MMR_stereographic.png",
BDI_png:"res/countries/BDI_stereographic.png",
BFA_png:"res/countries/BFA_stereographic.png",
BGR_png:"res/countries/BGR_stereographic.png",
BRN_png:"res/countries/BRN_stereographic.png",
BRA_png:"res/countries/BRA_stereographic.png",
BWA_png:"res/countries/BWA_stereographic.png",
BIH_png:"res/countries/BIH_stereographic.png",
BOL_png:"res/countries/BOL_stereographic.png",
BTN_png:"res/countries/BTN_stereographic.png",
BEN_png:"res/countries/BEN_stereographic.png",
BLZ_png:"res/countries/BLZ_stereographic.png",
BEL_png:"res/countries/BEL_stereographic.png",
BLR_png:"res/countries/BLR_stereographic.png",
BRB_png:"res/countries/BRB_stereographic.png",
BGD_png:"res/countries/BGD_stereographic.png",
BHR_png:"res/countries/BHR_stereographic.png",
BHS_png:"res/countries/BHS_stereographic.png",
AZE_png:"res/countries/AZE_stereographic.png",
AUT_png:"res/countries/AUT_stereographic.png",
AUS_png:"res/countries/AUS_stereographic.png",
HMD_png:"res/countries/HMD_stereographic.png",
NFK_png:"res/countries/NFK_stereographic.png",
ARM_png:"res/countries/ARM_stereographic.png",
ARG_png:"res/countries/ARG_stereographic.png",
ATG_png:"res/countries/ATG_stereographic.png",
AGO_png:"res/countries/AGO_stereographic.png",
AND_png:"res/countries/AND_stereographic.png",
DZA_png:"res/countries/DZA_stereographic.png",
ALB_png:"res/countries/ALB_stereographic.png",
AFG_png:"res/countries/AFG_stereographic.png",
ATA_png:"res/countries/ATA_stereographic.png",
SXM_png:"res/countries/SXM_stereographic.png",
*/