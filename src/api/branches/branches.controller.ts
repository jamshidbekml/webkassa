import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('branches')
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  // @Post()
  // @ApiOperation({ summary: 'Create branch' })
  // @ApiBody({ type: CreateBranchDto })
  // create(@Body() createBranchDto: CreateBranchDto) {
  //   return this.branchesService.create(createBranchDto);
  // }

  @Get()
  @ApiOperation({ summary: 'Get all branches' })
  @ApiQuery({ name: 'page', type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 10 })
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.branchesService.findAll(page, limit);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.branchesService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateBranchDto: UpdateBranchDto) {
  //   return this.branchesService.update(+id, updateBranchDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.branchesService.remove(+id);
  // }
}
