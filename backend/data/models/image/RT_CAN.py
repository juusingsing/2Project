import torch
import torch.nn as nn
import torchvision.models as models
import torch.nn.functional as F



# =====================================
# Basic Blocks 그대로 유지 (Att, GCM 등)
# =====================================
# Channel_Attention, Spatial_Attention, GCM, aggregation_init, aggregation_final,
# Refine, mini_Aspp, Cascaded_decoder 등은 그대로 두고 Thermal 전용으로만 연결.

# =====================================
# Thermal 전용 Encoder
# =====================================
class Cascaded_decoder(nn.Module):
    def __init__(self, n_class):
        super(Cascaded_decoder, self).__init__()
        # 간단 업샘플링 구조 (ResNet 출력 2048 → segmentation mask)
        self.up1 = nn.ConvTranspose2d(2048, 512, kernel_size=2, stride=2)
        self.up2 = nn.ConvTranspose2d(512, 128, kernel_size=2, stride=2)
        self.up3 = nn.ConvTranspose2d(128, 64, kernel_size=2, stride=2)
        self.final = nn.Conv2d(64, n_class, kernel_size=1)

    def forward(self, feats):
        # feats[-1] = thermal encoder의 마지막 feature (ResNet Layer4 출력, 채널=2048)
        x = feats[-1]  
        x = F.relu(self.up1(x))
        x = F.relu(self.up2(x))
        x = F.relu(self.up3(x))
        out = self.final(x)

        # out_ref = 간단히 out을 복사해서 리턴
        return out, out

class FA_encoder(nn.Module):
    def __init__(self, num_resnet_layers, dropout_rate: float = 0.09):
        super(FA_encoder, self).__init__()
        self.num_resnet_layers = num_resnet_layers
        if self.num_resnet_layers == 50:
            resnet_raw_model = models.resnet50(pretrained=True)
            self.inplanes = 2048
        elif self.num_resnet_layers == 152:
            resnet_raw_model = models.resnet152(pretrained=True)
            self.inplanes = 2048
        else:
            raise ValueError("Only ResNet50/152 supported")

        # Thermal 전용 Conv1 (1채널 입력)
        self.encoder_thermal_conv1 = nn.Conv2d(
            1, 64, kernel_size=7, stride=2, padding=3, bias=False
        )
        self.encoder_thermal_conv1.weight.data = torch.unsqueeze(
            torch.mean(resnet_raw_model.conv1.weight.data, dim=1), dim=1
        )

        self.encoder_thermal_bn1 = resnet_raw_model.bn1
        self.encoder_thermal_relu = resnet_raw_model.relu
        self.encoder_thermal_maxpool = resnet_raw_model.maxpool
        self.encoder_thermal_layer1 = resnet_raw_model.layer1
        self.encoder_thermal_layer2 = resnet_raw_model.layer2
        self.encoder_thermal_layer3 = resnet_raw_model.layer3
        self.encoder_thermal_layer4 = resnet_raw_model.layer4

    def forward(self, thermal):
        # layer0
        t = self.encoder_thermal_conv1(thermal)
        t = self.encoder_thermal_bn1(t)
        t = self.encoder_thermal_relu(t)
        t = self.encoder_thermal_maxpool(t)

        # ResNet layers
        t1 = self.encoder_thermal_layer1(t)
        t2 = self.encoder_thermal_layer2(t1)
        t3 = self.encoder_thermal_layer3(t2)
        t4 = self.encoder_thermal_layer4(t3)

        return [t, t1, t2, t3, t4]

# =====================================
# GasSegNet (Thermal 전용)
# =====================================
class GasSegNet(nn.Module):
    def __init__(self, n_class, num_resnet_layers=50):
        super(GasSegNet, self).__init__()
        self.FA_encoder = FA_encoder(num_resnet_layers)
        self.CD = Cascaded_decoder(n_class)

    def forward(self, x):
        # x: (N,1,H,W)
        thermal_feats = self.FA_encoder(x)
        out, out_ref = self.CD(thermal_feats)
        return out, out_ref, thermal_feats

# =====================================
# Unit Test
# =====================================
def unit_test():
    num_minibatch = 2
    thermal = torch.randn(num_minibatch, 1, 512, 640)  # only thermal
    model = GasSegNet(2, num_resnet_layers=50)
    out = model(thermal)
    print("Output shapes:")
    for o in out:
        if isinstance(o, list):
            print([t.shape for t in o])
        else:
            print(o.shape)

if __name__ == "__main__":
    unit_test()
