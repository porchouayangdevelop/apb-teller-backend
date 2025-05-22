import { tellerPool } from "../config/database.js";
var connection;
class tellerService {
  async getAllTellers() {
    try {
      connection = await tellerPool.getConnection();
      const [rows] = await connection.execute(`
        select count(*) as count from bpttlt where tlr_typ ='T';
        `);
      return rows[0].count;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  async getActiveTellers() {
    try {
      connection = await tellerPool.getConnection();
      const [rows] = await connection.execute(`
          SELECT 
          tlr as teller,
          tlr_br as branch,
          tlr_cn_nm as name,
          tlr_lvl as level,
          a.tlr_typ as type,
          dpt_no as department,
          CASE sign_sts
            WHEN 'O' THEN 'Online'
            WHEN 'T' THEN 'Temporary Logout'
            WHEN 'F' THEN 'Formal Logout'
            WHEN 'C' THEN 'Force Logout'
          END AS 'sign_status'
        FROM bpttlt a
        WHERE sign_sts IN ('O', 'T') and a.tlr_typ ='T'
        ORDER BY tlr_br ASC
        `);
      return rows;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  async getTellerStats() {
    connection;
    try {
      connection = await tellerPool.getConnection();
      const [rows] = await connection.execute(`
          SELECT 
          CASE sign_sts
            WHEN 'O' THEN 'Online'
            WHEN 'T' THEN 'Temporary Logout'
            WHEN 'F' THEN 'Formal Logout'
            WHEN 'C' THEN 'Force Logout'
          END AS status,
          COUNT(*) as count
        FROM bpttlt where tlr_typ ='T'
        GROUP BY sign_sts
        ORDER BY 
          CASE sign_sts
            WHEN 'O' THEN 1
            WHEN 'T' THEN 2
            WHEN 'F' THEN 3
            WHEN 'C' THEN 4
          END
          `);
      return rows;
    } catch (error) {
      console.error(error);
      throw error;
    }
    finally {
      if (connection) connection.release();
    }
  }

  async getTellerStatsByBranch() {
    try {
      connection = await tellerPool.getConnection();
      const [rows] = await connection.execute(`
        SELECT 
          tlr_br as branch,
          SUM(IF(sign_sts = 'O', 1, 0)) as online,
          SUM(IF(sign_sts = 'T', 1, 0)) as temp_logout
        FROM bpttlt
        WHERE sign_sts IN ('O', 'T') and tlr_typ ='T'
        GROUP BY tlr_br
        ORDER BY tlr_br ASC;
        `);
      return rows;
    } catch (error) {
      console.error(error);
      throw error;
    }
    finally {
      if (connection) connection.release();
    }
  }

  async getTellerById(tellerId) {
    try {
      connection = await tellerPool.getConnection();
      const [rows] = await connection.execute(`
        SELECT 
          tlr as teller,
          tlr_br as branch,
          tlr_cn_nm as name,
          tlr_lvl as level,
          a.tlr_typ as type,
          dpt_no as department,
          CASE sign_sts
            WHEN 'O' THEN 'Online'
            WHEN 'T' THEN 'Temporary Logout'
            WHEN 'F' THEN 'Formal Logout'
            WHEN 'C' THEN 'Force Logout'
          END AS 'sign_status'
        FROM bpttlt a
        WHERE tlr = ? and a.tlr_typ ='T'
        `, [tellerId]);
      return rows;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  async getTellerByBranchId(branchId) {
    try {
      connection = await tellerPool.getConnection();
      const [rows] = await connection.execute(`
        SELECT 
          tlr as teller,
          tlr_br as branch,
          tlr_cn_nm as name,
          tlr_lvl as level,
          a.tlr_typ as type,
          dpt_no as department,
          CASE sign_sts
            WHEN 'O' THEN 'Online'
            WHEN 'T' THEN 'Temporary Logout'
            WHEN 'F' THEN 'Formal Logout'
            WHEN 'C' THEN 'Force Logout'
          END AS 'sign_status'
        FROM bpttlt a
        WHERE tlr_br = ? AND sign_sts IN ('O', 'T') and a.tlr_typ ='T'
        ORDER BY tlr ASC
        `, [branchId]);
      return rows;
    } catch (error) {
      console.error(error);
      throw error;
    }
    finally {
      if (connection) connection.release();
    }
  }

  // Get count of tellers by branch who are signed in (Online or Temporary Logout)
  async getTellerCountStatsByBranchSignedIn() {
    try {
      connection = await tellerPool.getConnection();
      const [rows] = await connection.execute(`
        SELECT
          tlr_br as branch,
          SUM(IF(sign_sts = 'O', 1, 0)) as online,
          SUM(IF(sign_sts = 'T', 1, 0)) as temp_logout,
          COUNT(*) as total_active
        FROM bpttlt
        WHERE sign_sts IN ('O', 'T') and tlr_typ ='T'
        GROUP BY tlr_br
        ORDER BY tlr_br ASC;`);
      return rows.length;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  // Get count of branches with temporary logged out tellers
  async getTellCountStatsByBranchTemporarySignedOut() {
    try {
      connection = await tellerPool.getConnection();
      const [rows] = await connection.execute(`
        SELECT
          tlr_br as branch,
          COUNT(*) as count_temporary_logout,
          SUM(IF(sign_sts = 'T', 1, 0)) as total_temporary_logout
        FROM bpttlt
        WHERE sign_sts = 'T' and tlr_typ ='T'
        GROUP BY tlr_br
        ORDER BY tlr_br ASC;
        `);
      return rows.length;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  // Get count of branches with signed out tellers
  async getTellerCountStatsByBranchSignedOut() {
    try {
      connection = await tellerPool.getConnection();
      const [rows] = await connection.execute(`
        SELECT
          tlr_br as branch,
          COUNT(*) as count_active
        FROM bpttlt
        WHERE sign_sts = 'F' and tlr_typ ='T'
        GROUP BY tlr_br
        ORDER BY tlr_br ASC
        `);
      return rows.length;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  // Get total teller counts by status
  async getTotalTellers() {
    try {
      connection = await tellerPool.getConnection();
      const [rows] = await connection.execute(`
        SELECT COUNT(*) as total,
        SUM(IF(sign_sts = 'O', 1, 0)) as online,
        SUM(IF(sign_sts = 'T', 1, 0)) as temp_logout,
        SUM(IF(sign_sts = 'F', 1, 0)) as formal_logout,
        SUM(IF(sign_sts = 'C', 1, 0)) as force_logout 
        FROM bpttlt where tlr_typ ='T';
        `);
      const output = {
        totalCount: rows[0].total,
        online: rows[0].online,
        temp_logout: rows[0].temp_logout,
        formal_logout: rows[0].formal_logout,
        force_logout: rows[0].force_logout,
      }
      return output;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  // Get actual data for branches with signed-in tellers (not just count)
  async getBranchesWithSignedInTellers() {
    try {
      connection = await tellerPool.getConnection();
      const [rows] = await connection.execute(`
        SELECT
          tlr_br as branch,
          SUM(IF(sign_sts = 'O', 1, 0)) as online,
          SUM(IF(sign_sts = 'T', 1, 0)) as temp_logout,
          COUNT(*) as total_active
        FROM bpttlt
        WHERE sign_sts IN ('O', 'T') and tlr_typ ='T'
        GROUP BY tlr_br
        ORDER BY tlr_br ASC;`);
      return rows; // Return actual data, not just count
    } catch (error) {
      console.error("Error in getBranchesWithSignedInTellers:", error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  // Get actual data for branches with temporary logged out tellers
  async getBranchesWithTemporaryLogout() {
    try {
      connection = await tellerPool.getConnection();
      const [rows] = await connection.execute(`
        SELECT
          tlr_br as branch,
          COUNT(*) as count_temporary_logout,
          SUM(IF(sign_sts = 'T', 1, 0)) as total_temporary_logout
        FROM bpttlt
        WHERE sign_sts = 'T' and tlr_typ ='T'
        GROUP BY tlr_br
        ORDER BY tlr_br ASC;
        `);
      return rows; // Return actual data, not just count
    } catch (error) {
      console.error("Error in getBranchesWithTemporaryLogout:", error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  // Get actual data for branches with signed out tellers
  async getBranchesWithSignedOutTellers() {
    try {
      connection = await tellerPool.getConnection();
      const [rows] = await connection.execute(`
        SELECT
          tlr_br as branch,
          COUNT(*) as count_active
        FROM bpttlt
        WHERE sign_sts = 'F' and tlr_typ ='T'
        GROUP BY tlr_br
        ORDER BY tlr_br ASC
        `);
      return rows; // Return actual data, not just count
    } catch (error) {
      console.error("Error in getBranchesWithSignedOutTellers:", error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }


  async getBusinessDate() {
    try {
      connection = await tellerPool.getConnection();
      const [rows] = await connection.execute(`
        select date_format(ac_date,'%d/%m/%Y') as previous_date,
               date_format(next_ac_date,'%d/%m/%Y')  as currents_date,
               date_format(next_ac_datb,'%d/%m/%Y')  as next_date
          from sctjprm;`);

      const businessDate = {
        previous_date: rows[0].previous_date,
        current_date: rows[0].currents_date,
        next_date: rows[0].next_date
      };
      return businessDate;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  // Get all dashboard stats including the new count functions
  async getDashboardStats() {
    try {
      const [
        tellerCount,
        tellers,
        stats,
        branchStats,

        branchSignedIn, // return count
        branchTempSignedOut, // return count
        branchSignedOut, // return count

        // actual data
        branchesWithSignedIn,
        branchesWithTempLogout,
        branchesWithSignedOut,

        totalTellers,

        businessDate
      ] = await Promise.all([
        this.getAllTellers(), // count

        this.getActiveTellers(), // tellers active
        this.getTellerStats(), // status

        this.getTellerStatsByBranch(), // branch stats online, temporary logout

        this.getTellerCountStatsByBranchSignedIn(), // count online, temporary logout
        this.getTellCountStatsByBranchTemporarySignedOut(), // count temporary logout
        this.getTellerCountStatsByBranchSignedOut(), // count formal logout

        // fetch actual data
        this.getBranchesWithSignedInTellers(), // actual data
        this.getBranchesWithTemporaryLogout(), // actual data
        this.getBranchesWithSignedOutTellers(), // actual data

        this.getTotalTellers(), // total

        this.getBusinessDate() // business date
      ]);
      return {
        tellerCount,
        tellers,
        stats,
        branchStats,
        totalTellers,
        count: {
          branchSignedIn,
          branchTempSignedOut,
          branchSignedOut
        },
        branchDetails: {
          branchesWithSignedIn,
          branchesWithTempLogout,
          branchesWithSignedOut
        },
        businessDate
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}


export default new tellerService();