import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/auth/public';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { AvatarDto, SignupDto } from './user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private cloudinaryService: CloudinaryService,
  ) {}

  @Public()
  @Post('')
  async signup(@Body() signupDto: SignupDto) {
    return await this.userService.signup(
      signupDto.name,
      signupDto.email,
      signupDto.password,
    );
  }

  @Get()
  async getUser(@Request() req) {
    return this.userService.getUser(req.user.userId);
  }

  @Post('isPrivate')
  async togglePrivacy(@Request() req) {
    return this.userService.togglePrivacy(req.user.userId);
  }

  @UseInterceptors(FileInterceptor('image'))
  @Post('avatar')
  async createPost(
    @Body() body: AvatarDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (file) {
      console.log(file, 77);
    }

    const imageUrl = await this.cloudinaryService.uploadImage(file);

    body.avatar = imageUrl.secure_url;

    return await this.userService.createAvatar(req.user.userId, body);
  }
}
